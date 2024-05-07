import { ApiProperty } from '@nestjs/swagger';

export class ProductDetailsDto {
    @ApiProperty({
        description: 'Product url',
    })
    url: string;

    @ApiProperty({
        description: 'Product image url',
    })
    image: string;

    @ApiProperty({
        description: 'Product title',
    })
    title: string;

    @ApiProperty({
        description: 'Product code',
    })
    code: string;

    @ApiProperty({
        description: 'Product reviews quantity',
    })
    reviewsQuantity: number;

    @ApiProperty({
        description: 'Product ratings quantity',
        type: Number,
    })
    ratingQuantity: number;

    @ApiProperty({
        description: 'Product sellers quantity',
        type: Number,
    })
    offersQuantity: number;

    @ApiProperty({
        description: 'Product rating',
        type: Number,
    })
    rating: number;

    @ApiProperty({
        description: 'Product unit price',
        type: Number,
    })
    unitPrice: number;

    @ApiProperty({
        description: 'Product category',
    })
    category: string;

    @ApiProperty({
        description: 'Product parent category',
    })
    parentCategory: string;
}

export class ProductDetailsInfoDto {
    @ApiProperty({
        description: 'Product url',
    })
    url: string;

    @ApiProperty({
        description: 'Product title',
    })
    title: string;

    @ApiProperty({
        description: 'Product code',
    })
    code: string;

    @ApiProperty({
        description: 'Product rating',
    })
    rating: number;

    @ApiProperty({
        description: 'Product unit price',
    })
    unitPrice: number;

    @ApiProperty({
        description: 'Product images urls',
    })
    galleryImages: string[];

    @ApiProperty({
        description: 'Product reviews quantity',
    })
    reviewsQuantity: number;

    @ApiProperty({
        description: 'Product ratings quantity',
    })
    ratingQuantity: number;

    @ApiProperty({
        description: 'Product brand',
    })
    brand: string;

    @ApiProperty({
        description: 'Product weight',
    })
    weight: string;

    @ApiProperty({
        description: 'Kaspi creation date',
    })
    kaspiCreatedAt: string;

    @ApiProperty({
        description: 'Product revenue',
    })
    revenue: number;

    @ApiProperty({
        description: 'History period in days',
    })
    period: number;

    @ApiProperty({
        description: 'Date of last check',
    })
    dateLastCheck: string;

    @ApiProperty({
        description: 'Prices history',
    })
    prices?: { [key: string]: string };

    @ApiProperty({
        description: 'Reviews history',
    })
    reviews?: { [key: string]: string };

    @ApiProperty({
        description: 'Ratings history',
    })
    ratings?: { [key: string]: string };

    @ApiProperty({
        description: 'Sellers history',
    })
    sellers?: { [key: string]: string };
}
