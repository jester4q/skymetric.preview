/*
import { Injectable } from '@nestjs/common';

import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { ProductReviewDto } from './product.dto';

@ValidatorConstraint({ name: 'ReviewsValidation', async: false })
@Injectable()
export class ReviewsValidation implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: ProductReviewDto[]): boolean {
        return isValidProductReviewDto(value);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Reviews is not valid';
    }
}

export function isValidProductReviewDto(value: any): boolean {
    if (!Array.isArray(value)) {
        return false;
    }
    let valid = true;
    value.forEach((x) => {
        valid =
            valid &&
            x.author &&
            x.author.length &&
            x.date &&
            x.date.length &&
            x.externalId &&
            x.externalId.length &&
            x.rating >= 0;
    });

    return valid;
}
*/
