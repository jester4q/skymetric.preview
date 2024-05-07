import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TCategoryProduct, TProduct } from './product.types';
import {
    IAddDetailedProductModel,
    IAddProductModel,
    IProductModel,
} from './product.model';
import {
    Product,
    ProductHistory,
    ProductToSeller,
    Seller,
} from '../common/db/entities';
import { TSessionUser } from '../auth/token/authToken.service';
import { CategoryService } from '../category/category.service';
import { ApiError } from '../common/error';
import { daysBetween, strToDate } from '../utils';

export enum DataTypesEnum {
    prices = 'prices',
    reviews = 'reviews',
    sellers = 'sellers',
    rating = 'rating',
}

export type TDataType = 'prices' | 'rating' | 'reviews' | 'sellers';

export type TProductStatItem = { [key: string]: number };

export type TProductStat = {
    prices?: TProductStatItem;
    reviews?: TProductStatItem;
    ratings?: TProductStatItem;
    sellers?: TProductStatItem;
};

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductHistory)
        private historyRepository: Repository<ProductHistory>,
        @InjectRepository(Seller)
        private sellerRepository: Repository<Seller>,
        @InjectRepository(ProductToSeller)
        private productToSellerRepository: Repository<ProductToSeller>,
        private categoryService: CategoryService,
    ) {}

    public async fetchOne(id: number): Promise<TProduct | null> {
        const product = await this.productRepository.findOneBy({
            id: id,
        });
        return (product && this.toProduct(product)) || null;
    }

    public async fetchAllInCategory(
        categoryIds: number[],
        depth: number = 0,
        reverse: boolean = false,
        excludeCheckedToday: boolean = false,
    ): Promise<TCategoryProduct[]> {
        let builder = this.createFetchQueryBuilder(categoryIds, depth);
        builder.andWhere('`Product`.lastCheckedAt IS NOT NULL');
        if (excludeCheckedToday) {
            builder.andWhere('DATE(`Product`.lastCheckedAt) < CURDATE()');
        }
        builder.orderBy('`Product`.lastCheckedAt', reverse ? 'DESC' : 'ASC');
        const products1 = await builder.getMany();
        builder = this.createFetchQueryBuilder(categoryIds, depth);
        builder.andWhere('`Product`.lastCheckedAt IS NULL');
        builder.orderBy('`Product`.id', reverse ? 'DESC' : 'ASC');
        const products2 = await builder.getMany();
        return (
            reverse
                ? [...products2, ...products1]
                : [...products1, ...products2]
        ).map((item) => this.toCategoryProduct(item));
    }

    private createFetchQueryBuilder(
        categoryIds: number[],
        depth: number = 0,
        excludeCheckedToday: boolean = false,
    ): SelectQueryBuilder<Product> {
        const builder = this.productRepository.createQueryBuilder();
        builder
            .where('`Product`.categoryId in (:...ids)', {
                ids: categoryIds,
            })
            .andWhere('(`Product`.status=1 OR `Product`.attempt < 4)');
        if (depth > 0) {
            builder.andWhere(
                '`Product`.position > 0 AND `Product`.position <= ' + depth,
            );
        }

        return builder;
    }

    public async addAndUpdate(
        session: TSessionUser,
        model: IAddDetailedProductModel,
    ) {
        if (!model.isValid()) {
            throw new ApiError('Could not add/update product by this data');
        }

        const categoryPath = await this.categoryService.addPath(
            model.categoryName,
            model.categoryUrls,
        );
        model.setCategories(categoryPath);
        const product = await this.productRepository.findOneBy({
            code: model.code,
        });
        const newProduct = await this.add(session, model);
        if (!model.id) {
            model.setId(newProduct.id);
        }

        return this.save(session, model.id, model);
    }

    public async add(
        session: TSessionUser,
        source: IAddProductModel,
    ): Promise<TProduct> {
        if (!source.isValid()) {
            throw new ApiError('Could not add product by this data');
        }

        let product;
        if (source.code) {
            product = await this.productRepository.findOneBy({
                code: source.code,
            });
            if (!product) {
                product = await this.productRepository.findOneBy({
                    url: source.url,
                });
            }
        } else {
            product = await this.productRepository.findOneBy({
                url: source.url,
            });
        }
        if (product) {
            product.title = source.title || product.title;
            product.code = source.code || product.code;
            product.url = source.url || product.url;

            product.categories = source.categoryPath || product.categories;
            product.categoryId = source.categoryId || product.categoryId;
            if (source.position > 0) {
                let position = source.position;
                if (
                    product.position > 0 &&
                    source.collectingId == product.collectingId
                ) {
                    position = Math.min(product.position, position);
                }
                product.position = position;
            }
        } else {
            product = this.productRepository.create({
                code: source.code,
                title: source.title,
                url: source.url,
                categoryId: source.categoryId,
                categories: source.categoryPath,
                sessionId: session.sessionId,
                position: source.position,
            });
        }
        product.lastSeeAt = new Date();
        if (source.collectingId) {
            product.collectingId = source.collectingId;
        }
        await product.save();
        return this.toProduct(product);
    }

    public async save(
        session: TSessionUser,
        productId: number,
        source: IProductModel,
    ): Promise<TProduct> {
        if (!source.isValid()) {
            throw new ApiError('Could not save product data');
        }
        let product = await this.productRepository.findOneBy({
            id: productId,
        });

        if (!product) {
            throw new ApiError('Could not find product by id');
        }

        if (source.isNotFound) {
            await this.markProductAsFail(product, source.getErrorMessage || '');
            return this.toProduct(product);
        }

        const lastHistoryItem = await this.historyRepository.findOne({
            where: { productId },
            order: { id: 'DESC' },
        });

        product.lastCheckedAt = new Date();
        product.status = 1;
        product.failDate = null;
        product.failDescription = '';
        product.attempt = 0;

        if (!product.code) {
            product.code = source.code || null;
        }
        const history: Partial<ProductHistory> = {
            productId: productId,
            parsingId: source.parsingId,
            sessionId: session.sessionId,
            failDescription: source.hasErrors ? source.getErrorMessage : null,
        };
        if (!source.hasReviewsError) {
            //const { rating, quantity } = await this.saveReviews(session, source, productId);
            if (source.rating !== undefined) {
                product.productRating = source.rating;
                history.productRating = source.rating;
            }
            if (source.reviewsQuantity !== undefined) {
                product.reviewsQuantity = source.reviewsQuantity;
                history.reviewsQuantity = source.reviewsQuantity;
            }
            if (source.ratingQuantity !== undefined) {
                history.ratingQuantityChange =
                    source.ratingQuantity - product.ratingQuantity;
                if (history.ratingQuantityChange < 0) {
                    history.ratingQuantityChange = 0;
                }
                product.ratingQuantity = source.ratingQuantity;
                history.ratingQuantity = source.ratingQuantity;
            }
        }
        if (source.description && !source.hasDescriptionError) {
            product.description = source.description;
        }
        if (source.sellers && !source.hasSellersError) {
            let sellers = await this.saveSeller(session, source, productId);
            history.productSellers = sellers;
            product.offersLastCheckedAt = new Date();
        }
        if (source.unitPrice !== undefined) {
            product.unitPrice = source.unitPrice;
            history.unitPrice = source.unitPrice;
        }
        if (source.creditMonthlyPrice !== undefined) {
            product.creditMonthlyPrice = source.creditMonthlyPrice;
            history.creditMonthlyPrice = source.creditMonthlyPrice;
        }
        if (source.offersQuantity !== undefined) {
            product.offersQuantity = source.offersQuantity;
            history.offersQuantity = source.offersQuantity;
        }

        if (!source.hasDetailsError) {
            if (source.galleryImages !== undefined) {
                product.galleryImages = source.galleryImages;
            }

            if (!product.brand && source.brand !== undefined) {
                product.brand = source.brand;
            }

            if (source.weight !== undefined || source.weight !== '') {
                product.weight = source.weight;
            }

            if (!product.kaspiCreatedAt && source.createdTime !== undefined) {
                product.kaspiCreatedAt = strToDate(source.createdTime);
            }

            if (source.promoConditions !== undefined) {
                product.promoConditions = source.promoConditions;
            }
        }
        if (
            source.specification !== undefined &&
            !source.hasSpecificationError
        ) {
            product.specification = source.specification;
        }
        if (lastHistoryItem) {
            product.revenue =
                lastHistoryItem.revenue +
                product.unitPrice *
                    (product.ratingQuantity - lastHistoryItem.ratingQuantity);
        } else {
            product.revenue = product.unitPrice * product.ratingQuantity;
        }

        history.revenue = product.revenue;

        await this.historyRepository.save(history);
        const sql = this.historyRepository
            .createQueryBuilder('p')
            .where(
                'p.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW()',
            )
            .andWhere('p.productId = :id', { id: productId })
            .orderBy('id', 'ASC')
            .take(1)
            .getQuery();
        //console.log(sql);

        const h30 = await this.historyRepository
            .createQueryBuilder('p')
            .where(
                'p.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW()',
            )
            .andWhere('p.productId = :id', { id: productId })
            .orderBy('id', 'ASC')
            .take(1)
            .getOne();
        const h60 = await this.historyRepository
            .createQueryBuilder('p')
            .where(
                'p.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 60 DAY) AND NOW()',
            )
            .andWhere('p.productId = :id', { id: productId })
            .orderBy('id', 'ASC')
            .take(1)
            .getOne();
        const h90 = await this.historyRepository
            .createQueryBuilder('p')
            .where(
                'p.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 90 DAY) AND NOW()',
            )
            .andWhere('p.productId = :id', { id: productId })
            .orderBy('id', 'ASC')
            .take(1)
            .getOne();

        product.ratingQuantityChange30 =
            history.ratingQuantity - h30.ratingQuantity;
        product.ratingQuantityChange60 =
            history.ratingQuantity - h60.ratingQuantity;
        product.ratingQuantityChange90 =
            history.ratingQuantity - h90.ratingQuantity;

        await product.save();

        return this.toProduct(product);
    }

    private async saveSeller(
        session: TSessionUser,
        product: IProductModel,
        productId: number,
    ): Promise<{ sellerId: number; price: number }[]> {
        const sellers = product.sellers;
        if (!sellers || !sellers.length) {
            return [];
        }
        const result: { sellerId: number; price: number }[] = [];
        const toInsert: {
            [key: string]: { code: string; name: string; url: string };
        } = {};
        const toSelect: string[] = [];
        const codeAndPrice = {};
        sellers.forEach((item) => {
            toInsert[item.id] = {
                code: item.id,
                name: item.name,
                url: item.url,
            };
            toSelect.push(item.id);
            codeAndPrice[item.id] = item.price;
        });
        const items = await this.sellerRepository
            .createQueryBuilder()
            .where('code IN(:...ids)', { ids: toSelect })
            .getMany();
        const itemsByCode: Seller[] = [];
        items.forEach((item) => {
            itemsByCode[item.code] = item;
        });
        for (let code in toInsert) {
            if (!toInsert.hasOwnProperty(code)) {
                continue;
            }

            const item = toInsert[code];
            if (itemsByCode[code] !== undefined) {
                const oldItem: Seller = itemsByCode[code];
                if (item.name != oldItem.name || item.url != oldItem.url) {
                    oldItem.name = item.name;
                    oldItem.url = item.url;
                    await oldItem.save();
                }
            } else {
                const newItem = this.sellerRepository.create(item);
                newItem.sessionId = session.sessionId;
                await newItem.save();
                items.push(newItem);
            }
        }
        const sellersId: number[] = [];
        items.forEach((item) => {
            result.push({ sellerId: item.id, price: codeAndPrice[item.code] });
            sellersId.push(item.id);
        });

        const productToSellers = await this.productToSellerRepository.findBy({
            productId: productId,
        });

        const forDelete: number[] = [];
        const forAdd: number[] = [];
        const hasIds: number[] = [];
        productToSellers.forEach((item) => {
            hasIds.push(item.sellerId);
            if (sellersId.indexOf(item.sellerId) === -1) {
                forDelete.push(item.id);
            }
        });

        sellersId.forEach((id) => {
            if (hasIds.indexOf(id) === -1) {
                forAdd.push(id);
            }
        });
        if (forDelete.length) {
            await this.productToSellerRepository.delete(forDelete);
        }
        if (forAdd.length) {
            await this.productToSellerRepository
                .createQueryBuilder()
                .insert()
                .into(this.productToSellerRepository.target)
                .values(
                    forAdd.map((id) => ({
                        productId: productId,
                        sellerId: id,
                    })),
                )
                .orIgnore()
                .execute();
        }

        return result;
    }
    /*
    private async saveReviews(session: TSessionUser, product: IProductModel, productId: number): Promise<{ rating: number; quantity: number }> {
        if (product.reviews?.length) {
            const productCode = product.code;
            const reviews = product.reviews.map((review) => ({
                productId: productId,
                productCode: productCode,
                author: review.author,
                date: review.date,
                rating: review.rating,
                externalId: review.externalId,
                sessionId: session.sessionId,
            }));
            await this.reviewRepository.createQueryBuilder().insert().into(this.reviewRepository.target).values(reviews).orUpdate(['date']).execute();
        }
        const rating = await this.reviewRepository.average('rating', {
            productId: productId,
        });
        const quantity = await this.reviewRepository.count({
            where: {
                productId: productId,
            },
        });
        return { rating, quantity };
    }
    */

    private async markProductAsFail(product: Product, reason: string) {
        product.status = 0;
        product.failDate = new Date();
        product.failDescription = reason;
        product.attempt = product.attempt + 1;
        await product.save();
    }

    protected toProduct(product: Product): TProduct {
        return {
            id: product.id,
            title: product.title,
            code: product.code,
            creditMonthlyPrice: product.creditMonthlyPrice,
            description: product.description,
            galleryImages: product.galleryImages,
            lastCheckedAt: product.lastCheckedAt,
            offersQuantity: product.offersQuantity,
            productRating: product.productRating,
            reviewsQuantity: product.reviewsQuantity,
            ratingQuantity: product.ratingQuantity,
            specification: product.specification,
            unitPrice: product.unitPrice,
            url: product.url,
            weight: product.weight,
            revenue: product.revenue,
            brand: product.brand,
            kaspiCreatedAt: product.kaspiCreatedAt,
        };
    }

    private toCategoryProduct(product: Product): TCategoryProduct {
        return {
            id: product.id,
            title: product.title,
            code: product.code,
            url: product.url,
            checked: !!product.lastCheckedAt && !!product.promoConditions,
            offersChecked:
                !!product.offersLastCheckedAt &&
                daysBetween(product.offersLastCheckedAt, new Date()) <= 30,
            promoConditions: product.promoConditions,
        };
    }
}
