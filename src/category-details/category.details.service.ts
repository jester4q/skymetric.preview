import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../common/db/entities';
import { TCategoryDetails } from './category.details.types';
import { TRatingQuantityChange } from 'src/product-details/product.details.types';

@Injectable()
export class CategoryDetailsService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    public async fetchAll(
        categoryId: number,
        period: TRatingQuantityChange,
    ): Promise<TCategoryDetails[]> {
        const categories = await this.categoryRepository.findBy({
            parentCategoryId: categoryId,
            status: 1,
        });

        return categories.map((item) => this.toCategory(item, period));
    }

    protected toCategory(
        category: Category,
        period: TRatingQuantityChange,
    ): TCategoryDetails {
        return {
            id: category.id,
            name: category.name,
            products: category['products' + period],
            brands: category['brands' + period],
            offers: category['offers' + period],
            avgPrice: category['avgPrice' + period],
            sales: category['sales' + period],
            revenue: category['revenue' + period],
            salesToOffer: category['salesToOffer' + period],
            salesToProduct: category['salesToProduct' + period],
        };
    }
}
