import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Validate,
    isEnum,
} from 'class-validator';
import { IsNumberOrString } from '../product/numberOrString.validator';
import { UserRoleEnum } from '../user/types';

export class TariffDTO {
    @ApiProperty({
        description: 'Tariff id',
    })
    id: number;

    @ApiProperty({
        description: 'User role',
    })
    role: UserRoleEnum;

    @ApiProperty({
        description: 'Tariff name',
    })
    name: string;

    @ApiProperty({
        description: 'Tariff price',
    })
    price: number;

    @ApiProperty({
        description: 'Months',
    })
    months: number;
}

export class GetTariffsResponseDTO {
    @ApiProperty({
        description: 'Tariffs list',
    })
    items: TariffDTO[];
}

export class AddTariffRequestDTO {
    @ApiProperty({
        description: 'User role',
    })
    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;

    @ApiProperty({
        description: 'Tariff name',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Tariff price',
    })
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    price: number;

    @ApiProperty({
        description: 'Months',
    })
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    months: number;
}

export class PatchTariffRequestDTO {
    @ApiProperty({
        description: 'User role',
    })
    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: UserRoleEnum;

    @ApiProperty({
        description: 'Tariff name',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Tariff price',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    price?: number;

    @ApiProperty({
        description: 'Months',
    })
    @IsOptional()
    @Validate(IsNumberOrString)
    months?: number;
}
