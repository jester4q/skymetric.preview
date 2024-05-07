import { Injectable } from '@nestjs/common';

import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { ProductSellerDTO } from './product.dto';

@ValidatorConstraint({ name: 'SellersValidation', async: false })
@Injectable()
export class SellersValidation implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: ProductSellerDTO[]): boolean {
        return isValidProductSellerDto(value);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Sellers is not valid';
    }
}

export function isValidProductSellerDto(value: any): boolean {
    if (!Array.isArray(value)) {
        return false;
    }
    let valid = true;
    value.forEach((x) => {
        valid =
            valid &&
            x.merchantId &&
            x.merchantId.length > 0 &&
            x.name &&
            x.name.length > 0;
        x.price && x.price > 0;
        x.url && x.url.length > 0;
    });

    return valid;
}
