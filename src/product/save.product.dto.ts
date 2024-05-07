import { ApiProperty } from '@nestjs/swagger';
import {
    ProductImageDto,
    ProductSellerDTO,
    ProductSpecificationDto,
} from './product.dto';
import {
    IsArray,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Validate,
} from 'class-validator';
import { IsNumberOrString } from './numberOrString.validator';
import { Transform } from 'class-transformer';

export class SaveProductRequestDTO {
    @ApiProperty({
        description: 'Product id',
    })
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    id: number;

    @ApiProperty({
        description: 'Product code',
    })
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    code: string;

    @ApiProperty({
        description: 'Product parsing id',
    })
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    parsingId: number;

    @ApiProperty({
        description: 'Product title',
    })
    @IsString()
    @IsOptional()
    title: string;

    @ApiProperty({
        description: 'Product price',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    unitPrice: number;

    @ApiProperty({
        description: 'Product credit monthly price',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    creditMonthlyPrice: number;

    @ApiProperty({
        description: 'Product rating',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    rating: number;

    @ApiProperty({
        description: 'Product url',
    })
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiProperty({
        description: 'Product images',
    })
    @IsOptional()
    @IsArray()
    galleryImages: ProductImageDto[];

    @ApiProperty({
        description: 'Amount product reviews',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    reviewsQuantity: number;

    @ApiProperty({
        description: 'Amount product reviews',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    ratingQuantity: number;

    @ApiProperty({
        description: 'Amount product offers',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    offersQuantity: number;

    @ApiProperty({
        description: 'Product weight',
    })
    @IsOptional()
    //@Validate(IsNumberOrString)
    weight: string;

    @ApiProperty({
        description: 'Product brand',
    })
    @IsOptional()
    brand: string;

    @ApiProperty({
        description: 'Product creation date',
    })
    @IsOptional()
    createdTime: string;

    @ApiProperty({
        description: 'Product specification',
    })
    @IsOptional()
    @IsArray()
    specification: ProductSpecificationDto[];

    @ApiProperty({
        description: 'Product description',
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Product sellers',
    })
    @IsOptional()
    @IsArray()
    sellers: ProductSellerDTO[];

    @ApiProperty({
        description: 'Errors of get product info',
    })
    @IsOptional()
    @IsObject()
    errors: any;

    @ApiProperty({
        description: 'Product is not found',
    })
    @IsOptional()
    @Transform(({ value }) => value == '1' || value == 'true' || value === true)
    isNotFound: boolean;

    @ApiProperty({
        description: 'Errors of get product info',
    })
    @IsOptional()
    @IsObject()
    promoConditions: any;
}
