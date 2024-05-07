import { ApiProperty } from '@nestjs/swagger';
import { CategoryProductDto, ProductDto } from './product.dto';
import { IsOptional, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNumberOrString } from './numberOrString.validator';

export class GetProductsResponseDto {
    items: ProductDto[];
}

export class GetCategoryProductsResponseDto {
    items: CategoryProductDto[];
}

export class GetCategoryProductsQueryDto {
    @ApiProperty({
        description: 'Reverse result',
    })
    @IsOptional()
    @Transform(({ value }) => value == '1' || value == 'true' || value === true)
    reverse: boolean;

    @ApiProperty({
        description: 'Exclude products checked today',
    })
    @IsOptional()
    @Transform(({ value }) => value == '1' || value == 'true' || value === true)
    excludeCheckedToday: boolean;

    @ApiProperty({
        description: 'Depth of position in each category',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    depth: number;
}
