import { Injectable } from '@nestjs/common';

import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ProductCategoryNameDto } from './product.dto';

@ValidatorConstraint({ name: 'CategoryUrlsValidation', async: false })
@Injectable()
export class CategoryUrlsValidation implements ValidatorConstraintInterface {
    constructor() {}

    async validate(value: ProductCategoryNameDto): Promise<boolean> {
        if (!value) {
            return false;
        }
        const fail = Object.keys(value).find((key: string) => {
            if (key.indexOf('level') !== 0) {
                return false;
            }
            if (value[key] && !this.checkUrl(value[key])) {
                return true;
            }
        });

        return true;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Category urls is not valid';
    }

    private checkUrl(str: any): boolean {
        let url;
        try {
            url = new URL(str);
        } catch (err) {
            return false;
        }
        if (url.host.indexOf('kaspi.kz') == -1) {
            return false;
        }
        if (url.pathname.indexOf('shop/nur-sultan/c/') === -1) {
            return false;
        }
        return true;
    }
}
