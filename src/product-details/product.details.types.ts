import { TRange } from '../common/page/types';

export enum DataTypesEnum {
    prices = 'prices',
    reviews = 'reviews',
    sellers = 'sellers',
    rating = 'rating',
    ratingCount = 'ratingсount',
}

export enum ModeEnum {
    values = 'values',
    dates = 'dates',
}

export type TDataType =
    | DataTypesEnum.prices
    | DataTypesEnum.rating
    | DataTypesEnum.reviews
    | DataTypesEnum.sellers
    | DataTypesEnum.ratingCount;

export type TProductStatItem = { [key: string]: string };

export type TProductStat = {
    prices?: TProductStatItem;
    reviews?: TProductStatItem;
    ratings?: TProductStatItem;
    ratingсount?: TProductStatItem;
    sellers?: TProductStatItem;
};

export type TProductDetails = {
    url: string;
    image: string;
    title: string;
    code: string;
    reviewsQuantity: number;
    ratingQuantity: number;
    offersQuantity: number;
    rating: number;
    unitPrice: number;
    category: string;
    parentCategory: string;
    ratingQuantityChange: number;
    weight: string;
    brand: string;
    revenue: number;
    daysOnKaspi: number;
};

export type TProductDetailsParams = {
    ratingQuantityChange: TRatingQuantityChange;
};

export type TRatingQuantityChange = '30' | '60' | '90';

export type TProductDetailsFilters = {
    price?: TRange<number>;
    revenue?: TRange<number>;
    ratingQuantity?: TRange<number>;
    ratingQuantityChange30?: TRange<number>;
    ratingQuantityChange60?: TRange<number>;
    ratingQuantityChange90?: TRange<number>;
    offersQuantity?: TRange<number>;
    rating?: TRange<number>;
};

export type TProductDetailsSorting =
    | 'unitPrice,asc'
    | 'unitPrice,desc'
    | 'ratingQuantity,asc'
    | 'ratingQuantity,desc'
    | 'offersQuantity,asc'
    | 'offersQuantity,desc'
    | 'productRating,asc'
    | 'productRating,desc';
