import { Injectable } from '@nestjs/common';

import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { ProductImageDto, ProductSpecificationDto } from './product.dto';

@ValidatorConstraint({ name: 'ProductSpecificationValidation', async: false })
@Injectable()
export class ProductSpecificationValidation
    implements ValidatorConstraintInterface
{
    constructor() {}

    validate(value: ProductSpecificationDto[]): boolean {
        return isValidProductSpecificationDto(value);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Specification is not valid';
    }
}

export function isValidProductSpecificationDto(value: any) {
    if (!Array.isArray(value)) {
        return false;
    }
    let valid = true;
    value.forEach((x) => {
        valid =
            valid &&
            x.value &&
            x.value.length > 0 &&
            x.name &&
            x.name.length > 0;
    });

    return valid;
}
