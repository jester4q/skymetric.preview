import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';

export class CategoryDTO {
    @ApiProperty({
        description: 'Category id',
    })
    id: number;

    @ApiProperty({
        description: 'Category name',
    })
    name: string;

    @ApiProperty({
        description: 'Category level',
    })
    level: number;

    @ApiProperty({
        description: 'Category url',
    })
    url: string;
}

export class SimpleCategoryDTO {
    @ApiProperty({
        description: 'Category id',
    })
    id: number;

    @ApiProperty({
        description: 'Category name',
    })
    name: string;

    children?: SimpleCategoryDTO[];
}

export class GetCategoriesResponseDTO extends CategoryDTO {
    children?: CategoryDTO[];
}

export class GetAllCategoriesResponseDTO {
    items?: SimpleCategoryDTO[];
}

export class SaveCategoriesRequestDTOItem {
    @ApiProperty({
        description: 'Category name',
    })
    @IsNotEmpty()
    @IsString()
    name: string;
    @ApiProperty({
        description: 'Category url',
    })
    @IsNotEmpty()
    @IsUrl()
    url: string;
}

export class SaveCategoriesRequestDTO {
    @ApiProperty({
        description: 'Categories for save',
        type: 'array',
        items: { $ref: getSchemaPath(SaveCategoriesRequestDTOItem) },
    })
    @IsOptional()
    @IsArray()
    categories: SaveCategoriesRequestDTOItem[];
    @ApiProperty({
        description: 'Set category empty',
        type: 'boolean',
    })
    @IsNotEmpty()
    @Transform(({ value }) => value == '1' || value == 'true' || value === true)
    empty: boolean;
}
