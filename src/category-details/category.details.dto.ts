import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';

export class CategoryDetailsDTO {
    @ApiProperty({
        description: 'Category id',
    })
    id: number;

    @ApiProperty({
        description: 'Category name',
    })
    name: string;
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

export class GetCategoryDetailsDTOResponseDTO {
    children?: CategoryDetailsDTO[];
}
