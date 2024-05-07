import { Injectable } from '@nestjs/common';

import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ProductImageDto } from './product.dto';

@ValidatorConstraint({ name: 'GalleryImageValidation', async: false })
@Injectable()
export class GalleryImageValidation implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: ProductImageDto[]): boolean {
        return isValidProductImageDto(value);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Gallery images is not valid';
    }
}

export function isValidProductImageDto(value: any): boolean {
    if (!Array.isArray(value)) {
        return false;
    }
    let valid = true;
    value.forEach((x) => {
        valid = valid && x.large && checkUrl(x.large);
        valid = valid && x.medium && checkUrl(x.medium);
        valid = valid && x.small && checkUrl(x.small);
    });

    return valid;
}

function checkUrl(str: any): boolean {
    try {
        const url = new URL(str);
        if (!url.host.indexOf('kaspi.kz')) {
            return false;
        }
    } catch (err) {
        return false;
    }

    return true;
}
