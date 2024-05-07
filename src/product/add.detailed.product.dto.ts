import { ApiProperty } from '@nestjs/swagger';
import {
    ProductCategoryNameDto,
    ProductCategoryUrlsDto,
    ProductImageDto,
    ProductSellerDTO,
    ProductSpecificationDto,
} from './product.dto';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    Validate,
} from 'class-validator';
import {
    GalleryImageValidation,
    isValidProductImageDto,
} from './galleryImages.validation';
import { ProductUrlValidation } from './url.validation';
import {
    ProductSpecificationValidation,
    isValidProductSpecificationDto,
} from './specification.validation';
import { CategoryNameValidation } from './categoryname.validation';
import {
    SellersValidation,
    isValidProductSellerDto,
} from './sellers.validation';
import { Transform } from 'class-transformer';
import { isNumber, isString } from '../utils';
import { CategoryUrlsValidation } from './categoryUrls.validation';
import { IsProductCode } from './productCode.validator';

export class AddDetailedProductRequestDTO {
    @ApiProperty({
        description: 'Product code',
    })
    @IsNotEmpty()
    @Validate(IsProductCode)
    code: string;

    @ApiProperty({
        description: 'Product title',
        type: String,
    })
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Product url',
    })
    @IsNotEmpty()
    @IsUrl()
    @Validate(ProductUrlValidation)
    url: string;

    @ApiProperty({
        description: 'Product category',
        type: ProductCategoryNameDto,
    })
    @Validate(CategoryNameValidation)
    categoryName: ProductCategoryNameDto;

    @ApiProperty({
        description: 'Product category urls',
        type: ProductCategoryNameDto,
    })
    @IsOptional()
    @Validate(CategoryUrlsValidation)
    categoryUrls: ProductCategoryUrlsDto;

    @ApiProperty({
        description: 'Product unit price',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => validOrUndefined(isNumber(value), value))
    unitPrice: number | undefined;

    @ApiProperty({
        description: 'Product credit monthly price',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => validOrUndefined(isNumber(value), value))
    creditMonthlyPrice: number | undefined;

    @ApiProperty({
        description: 'Amount of reviews',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => validOrUndefined(isNumber(value), value))
    reviewsQuantity: number | undefined;

    @ApiProperty({
        description: 'Amount of ratings',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => validOrUndefined(isNumber(value), value))
    ratingQuantity: number | undefined;

    @ApiProperty({
        description: 'Product specification',
        required: false,
        isArray: true,
        type: ProductSpecificationDto,
    })
    @IsOptional()
    @Validate(ProductSpecificationValidation)
    @Transform(({ value }) =>
        validOrUndefined(isValidProductSpecificationDto(value), value),
    )
    specification: ProductSpecificationDto[] | undefined;

    @ApiProperty({
        description: 'Product images',
        required: false,
        isArray: true,
        type: ProductImageDto,
    })
    @IsOptional()
    @Validate(GalleryImageValidation)
    @Transform(({ value }) =>
        validOrUndefined(isValidProductImageDto(value), value),
    )
    galleryImages: ProductImageDto[] | undefined;

    @ApiProperty({
        description: 'Amount product offers',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => validOrUndefined(isNumber(value), value))
    offersQuantity: number | undefined;

    @ApiProperty({
        description: 'Product rating',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => validOrUndefined(isNumber(value), value))
    rating: number | undefined;

    @ApiProperty({
        description: 'Product sellers',
        required: false,
        isArray: true,
        type: ProductSellerDTO,
    })
    @IsOptional()
    @Validate(SellersValidation)
    @Transform(({ value }) =>
        validOrUndefined(isValidProductSellerDto(value), value),
    )
    sellers: ProductSellerDTO[] | undefined;

    @ApiProperty({
        description: 'Product description',
        required: false,
        type: String,
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => validOrUndefined(isString(value), value))
    description: string | undefined;
}

function validOrUndefined(valid: boolean, value: any): any {
    if (valid) {
        return value;
    }
    return undefined;
}
