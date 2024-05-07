import { ApiProperty } from '@nestjs/swagger';
import { ProductCategoryPathDto } from './product.dto';
import {
    IsNotEmpty,
    IsObject,
    IsString,
    Validate,
    IsOptional,
} from 'class-validator';
import { IsNumberOrString } from './numberOrString.validator';
import { IsProductCode } from './productCode.validator';

export class AddProductRequestDTO {
    @ApiProperty({
        description: 'Product code',
        type: Number,
    })
    @IsOptional()
    @Validate(IsProductCode)
    code: string;

    @ApiProperty({
        description: 'Product title',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Product url',
    })
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiProperty({
        description: 'Product category',
    })
    @IsNotEmpty()
    @IsObject()
    categories: ProductCategoryPathDto;

    @ApiProperty({
        description: 'Product category',
    })
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    position: number;

    @ApiProperty({
        description: 'Product collector id',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    collectingId: number;
}
