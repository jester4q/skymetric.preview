import { Injectable } from '@nestjs/common';
import {
    Between,
    FindOperator,
    FindOptionsWhere,
    In,
    IsNull,
    LessThan,
    LessThanOrEqual,
    MoreThanOrEqual,
    Not,
    Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../common/db/entities/product.entity';
import { ProductHistory } from '../common/db/entities/productHistory.entity';
import { dateToStr, daysBetween } from '../utils';
import { ApiError } from '../common/error';
import { CategoryService } from '../category/category.service';
import { TListingPage, TPage, TSorting } from '../common/page/types';
import {
    DataTypesEnum,
    TProductDetails,
    TProductDetailsFilters,
    TProductDetailsParams,
    TProductStat,
} from './product.details.types';
import { listingPage } from '../common/page/listing.page';

@Injectable()
export class ProductDetailsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductHistory)
        private historyRepository: Repository<ProductHistory>,
        private categoryService: CategoryService,
    ) {}

    public async fetchOne(code: string): Promise<Product | null> {
        const product = await this.productRepository.findOneBy({
            code: code,
        });
        if (!product || !product.lastCheckedAt) {
            throw new ApiError(`Product is not found by code ${code} (1)`);
        }
        const hasHistory = await this.hasHistoryInPast(product.id);
        if (!hasHistory) {
            throw new ApiError(`Product is not found by code ${code} (2)`);
        }

        return product;
    }

    public async fetchAllFree(
        categoriesIds: number[],
        params?: TProductDetailsParams,
        filters?: TProductDetailsFilters,
        page?: TPage,
    ) {
        const categories = await this.categoryService.fetchCategoriesByIds(
            categoriesIds,
            true,
        );
        if (!categories.length || categories.length != categoriesIds.length) {
            throw new ApiError(
                'Could not define categories by ' +
                    JSON.stringify(categoriesIds),
            );
        }

        return this.fetchAllByCategories(
            categories.map((category) => category.id),
            params,
            filters,
            page,
        );
    }

    public async fetchAll(
        categoriesIds: number[],
        params?: TProductDetailsParams,
        filters?: TProductDetailsFilters,
        page?: TPage,
    ): Promise<TListingPage<TProductDetails>> {
        const categories = await this.categoryService.fetchCategoriesByIds(
            categoriesIds,
        );
        if (!categories.length || categories.length != categoriesIds.length) {
            throw new ApiError(
                'Could not define categories by ' +
                    JSON.stringify(categoriesIds),
            );
        }

        return this.fetchAllByCategories(
            categories.map((category) => category.id),
            params,
            filters,
            page,
        );
    }

    private async fetchAllByCategories(
        categoriesIds: number[],
        params?: TProductDetailsParams,
        filters?: TProductDetailsFilters,
        page?: TPage,
    ): Promise<TListingPage<TProductDetails>> {
        const filterByCategories = [];
        for (let i = 0; i < categoriesIds.length; i++) {
            const ids = await this.categoryService.fetchCategoryLeavesIds(
                categoriesIds[i],
            );
            filterByCategories.push(...ids);
        }
        const limit = !page.size || isNaN(page.size) ? 10 : page.size;
        const unitPrice =
            filters.price &&
            this.rangeFilter(filters.price.from, filters.price.to);
        const revenue =
            filters.revenue &&
            this.rangeFilter(filters.revenue.from, filters.revenue.to);
        const ratingQuantity =
            filters.ratingQuantity &&
            this.rangeFilter(
                filters.ratingQuantity.from,
                filters.ratingQuantity.to,
            );
        const offersQuantity =
            filters.offersQuantity &&
            this.rangeFilter(
                filters.offersQuantity.from,
                filters.offersQuantity.to,
            );
        const productRating =
            filters.rating &&
            this.rangeFilter(filters.rating.from, filters.rating.to);

        const productFilter: FindOptionsWhere<Product> = {
            categoryId: In(filterByCategories),
            unitPrice,
            revenue,
            ratingQuantity,
            offersQuantity,
            productRating,
            lastCheckedAt: Not(IsNull()),
        };
        if (filters.ratingQuantityChange30) {
            const range = filters.ratingQuantityChange30;
            productFilter.ratingQuantityChange30 = this.rangeFilter(
                range.from,
                range.to,
            );
        }
        if (filters.ratingQuantityChange60) {
            const range = filters.ratingQuantityChange60;
            productFilter.ratingQuantityChange60 = this.rangeFilter(
                range.from,
                range.to,
            );
        }
        if (filters.ratingQuantityChange90) {
            const range = filters.ratingQuantityChange90;
            productFilter.ratingQuantityChange90 = this.rangeFilter(
                range.from,
                range.to,
            );
        }

        const sorting = page.sorting || {
            field: 'id',
            order: 'ASC',
        };

        const count = await this.productRepository.countBy(productFilter);
        const maxPage = Math.ceil(count / limit);
        if (maxPage < page.number && page.number != 1) {
            throw new ApiError('Page number is not valid');
        }
        const products = await this.productRepository.find({
            where: productFilter,
            order: { [sorting.field]: sorting.order },
            skip: (page.number - 1) * limit,
            take: limit,
        });

        const categories = await this.categoryService.fetchAll(
            products.flatMap((item) => {
                const level = Object.keys(item.categories).length;
                return [
                    item.categories.level1,
                    item.categories['level' + level],
                ];
            }),
        );
        //const productIds = products.map((product) => product.id);
        let ratingQuantityChangeField: string;
        if (params && params.ratingQuantityChange) {
            ratingQuantityChangeField =
                'ratingQuantityChange' + params.ratingQuantityChange;
        }

        const categoryPairs = {};
        categories.forEach((item) => {
            categoryPairs[item.id] = item.name;
        });

        return listingPage<TProductDetails>(
            products.map((item) => ({
                category: categoryPairs[item.categoryId],
                code: item.code,
                image:
                    (item.galleryImages &&
                        item.galleryImages.length &&
                        item.galleryImages[0].large) ||
                    '',
                parentCategory: categoryPairs[item.categories.level1],
                rating: 1 * item.productRating,
                ratingQuantity: 1 * item.ratingQuantity,
                reviewsQuantity: 1 * item.reviewsQuantity,
                offersQuantity: 1 * item.offersQuantity,
                title: item.title,
                unitPrice: 1 * item.unitPrice,
                url: item.url,
                ratingQuantityChange: ratingQuantityChangeField
                    ? item[ratingQuantityChangeField]
                    : 0,
                weight: item.weight,
                brand: item.brand,
                revenue: item.revenue,
                daysOnKaspi: daysBetween(
                    new Date(item.kaspiCreatedAt),
                    new Date(),
                ),
            })),
            page.number,
            count,
            limit,
        );
    }

    public async hasHistoryInPast(productId: number): Promise<boolean> {
        const today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        const some = await this.historyRepository.findOne({
            where: { productId: productId, createdAt: LessThan(today) },
        });
        return !!some;
    }

    public async fetchStatByDates(
        productId: number,
        period: number,
        types: DataTypesEnum[],
    ): Promise<TProductStat> {
        const date = new Date();
        const from = new Date();
        from.setDate(date.getDate() - period);
        from.setHours(0);
        from.setMinutes(0);
        from.setSeconds(0);
        const to = new Date();
        to.setDate(date.getDate() - 1);
        to.setHours(23);
        to.setMinutes(59);
        to.setSeconds(59);

        const history = await this.historyRepository.find({
            where: { productId: productId, createdAt: Between(from, to) },
            order: { createdAt: 'DESC' }, // last got price in day
        });
        const result: TProductStat = {};
        for (let i = period; i >= 1; i--) {
            const currentDate = new Date();
            currentDate.setDate(date.getDate() - i);
            const current = dateToStr(currentDate);
            const item = history.find(
                (x) => dateToStr(x.createdAt) === current,
            );
            if (types.includes(DataTypesEnum.prices)) {
                if (!result.prices) {
                    result.prices = {};
                }
                result.prices[current] = '' + ((item && item.unitPrice) || '');
            }
            if (types.includes(DataTypesEnum.rating)) {
                if (!result.ratings) {
                    result.ratings = {};
                }
                result.ratings[current] =
                    '' + ((item && item.productRating) || '');
            }
            if (types.includes(DataTypesEnum.reviews)) {
                if (!result.reviews) {
                    result.reviews = {};
                }
                result.reviews[current] =
                    '' + ((item && item.reviewsQuantity) || '');
            }
            if (types.includes(DataTypesEnum.ratingCount)) {
                if (!result.ratingсount) {
                    result.ratingсount = {};
                }
                result.ratingсount[current] =
                    '' + ((item && item.ratingQuantity) || '');
            }
            if (types.includes(DataTypesEnum.sellers)) {
                if (!result.sellers) {
                    result.sellers = {};
                }
                result.sellers[current] =
                    '' + ((item && item.offersQuantity) || '');
            }
        }

        return result;
    }

    public async fetchStatByValues(
        productId: number,
        period: number,
        types: DataTypesEnum[],
    ): Promise<TProductStat> {
        const history = await this.historyRepository.find({
            where: { productId: productId },
            order: { createdAt: 'DESC' },
            take: period,
        });
        const result: TProductStat = {};
        history.forEach((item) => {
            const date = item.createdAt.toISOString().split('T')[0];
            if (types.includes(DataTypesEnum.prices)) {
                if (!result.prices) {
                    result.prices = {};
                }
                result.prices[date] = '' + ((item && item.unitPrice) || '');
            }
            if (types.includes(DataTypesEnum.rating)) {
                if (!result.ratings) {
                    result.ratings = {};
                }
                result.ratings[date] =
                    '' + ((item && item.productRating) || '');
            }
            if (types.includes(DataTypesEnum.reviews)) {
                if (!result.reviews) {
                    result.reviews = {};
                }
                result.reviews[date] =
                    '' + ((item && item.reviewsQuantity) || '');
            }
            if (types.includes(DataTypesEnum.ratingCount)) {
                if (!result.ratingсount) {
                    result.ratingсount = {};
                }
                result.ratingсount[date] =
                    '' + ((item && item.ratingQuantity) || '');
            }
            if (types.includes(DataTypesEnum.sellers)) {
                if (!result.sellers) {
                    result.sellers = {};
                }
                result.sellers[date] =
                    '' +
                    ((item.productSellers && item.productSellers.length) || 0);
            }
        });

        return result;
    }

    private rangeFilter(
        from: number,
        to: number,
    ): FindOperator<any> | undefined {
        let f;
        if (from !== undefined && to !== undefined) {
            f = Between(from, to);
        } else if (from !== undefined) {
            f = MoreThanOrEqual(from);
        } else if (to !== undefined) {
            f = LessThanOrEqual(to);
        }

        return f;
    }
}
