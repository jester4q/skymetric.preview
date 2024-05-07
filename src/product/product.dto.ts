import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
    @ApiProperty({
        description: 'Product id',
    })
    id: number;

    @ApiProperty({
        description: 'Product code',
    })
    code: string;

    @ApiProperty({
        description: 'Product title',
    })
    title: string;

    @ApiProperty({
        description: 'Product url',
    })
    url: string;

    @ApiProperty({
        description: 'Product init price',
    })
    unitPrice: number;

    @ApiProperty({
        description: 'Product credit monthly price',
    })
    creditMonthlyPrice: number;

    @ApiProperty({
        description: 'Amount of sellers',
    })
    offersQuantity: number;

    @ApiProperty({
        description: 'Amount of reviews',
    })
    reviewsQuantity: number;

    @ApiProperty({
        description: 'Amount of ratings',
    })
    ratingQuantity: number;

    @ApiProperty({
        description: 'Product description',
    })
    description: string;

    @ApiProperty({
        description: 'Product specification',
    })
    specification: ProductSpecificationDto[];

    @ApiProperty({
        description: 'Product images gallery urls',
    })
    galleryImages: ProductImageDto[];

    @ApiProperty({
        description: 'Product last check date',
    })
    lastCheckedAt: Date;

    @ApiProperty({
        description: 'Product rating',
    })
    productRating: number;
}

export class CategoryProductDto {
    @ApiProperty({
        description: 'Product id',
    })
    id: number;

    @ApiProperty({
        description: 'Product code',
    })
    code: string;

    @ApiProperty({
        description: 'Product title',
    })
    title: string;

    @ApiProperty({
        description: 'Product url',
    })
    url: string;

    @ApiProperty({
        description: 'Product is checked ',
    })
    checked: boolean;

    @ApiProperty({
        description: 'Product offers are checked ',
    })
    offersChecked: boolean;

    @ApiProperty({
        description: 'Product promo conditions',
    })
    promoConditions: any;
}

export class ProductSpecificationDto {
    @ApiProperty({
        description: 'Field name',
    })
    name: string;
    @ApiProperty({
        description: 'Field value',
    })
    value: string;
}

export class ProductImageDto {
    @ApiProperty({
        description: 'Lage image url',
    })
    large: string;

    @ApiProperty({
        description: 'Medium image url',
    })
    medium: string;

    @ApiProperty({
        description: 'Small image url',
    })
    small: string;
}

export class ProductCategoryPathDto {
    @ApiProperty({
        description: 'Level 1 category id',
        required: true,
    })
    level1: number;
    @ApiProperty({
        description: 'Level 2 category id',
        required: true,
    })
    level2: number;
    @ApiProperty({
        description: 'Level 3 category id',
        required: false,
    })
    level3?: number;
    @ApiProperty({
        description: 'Level 4 category id',
        required: false,
    })
    level4?: number;
    @ApiProperty({
        description: 'Level 5 category id',
        required: false,
    })
    level5?: number;
    @ApiProperty({
        description: 'Level 6 category id',
        required: false,
    })
    level6?: number;
}

export class ProductCategoryNameDto {
    @ApiProperty({
        description: 'Level 1 category name',
        required: true,
    })
    level1: string;
    @ApiProperty({
        description: 'Level 2 category name',
        required: true,
    })
    level2: string;
    @ApiProperty({
        description: 'Level 3 category name',
        required: false,
    })
    level3?: string;
    @ApiProperty({
        description: 'Level 4 category name',
        required: false,
    })
    level4?: string;
    @ApiProperty({
        description: 'Level 5 category name',
        required: false,
    })
    level5?: string;
    @ApiProperty({
        description: 'Level 6 category name',
        required: false,
    })
    level6?: string;
}

export class ProductCategoryUrlsDto {
    @ApiProperty({
        description: 'Level 1 category url',
        required: false,
    })
    level1?: string;
    @ApiProperty({
        description: 'Level 2 category url',
        required: false,
    })
    level2?: string;
    @ApiProperty({
        description: 'Level 3 category url',
        required: false,
    })
    level3?: string;
    @ApiProperty({
        description: 'Level 4 category url',
        required: false,
    })
    level4?: string;
    @ApiProperty({
        description: 'Level 5 category url',
        required: false,
    })
    level5?: string;
    @ApiProperty({
        description: 'Level 6 category url',
        required: false,
    })
    level6?: string;
}

export class ProductSellerDTO {
    @ApiProperty({
        description: 'Product seller name',
    })
    name: string;

    @ApiProperty({
        description: 'Product seller price',
    })
    price: number;

    @ApiProperty({
        description: 'Product seller merchantId',
    })
    merchantId: string;

    @ApiProperty({
        description: 'Product seller url',
    })
    url: string;
}
