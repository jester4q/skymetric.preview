import { BadRequestException, Injectable } from '@nestjs/common';

import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { CategoryService } from '../category/category.service';
import { ProductCategoryPathDto } from './product.dto';

@ValidatorConstraint({ name: 'CategoryPathValidation', async: true })
@Injectable()
export class CategoryPathValidation implements ValidatorConstraintInterface {
    constructor(private readonly categoryService: CategoryService) {}

    async validate(value: ProductCategoryPathDto): Promise<boolean> {
        const path = Object.values(value).filter((x) => x > 0);
        if (path.length < 2) {
            throw new BadRequestException('Category path is not valid');
        }
        const valid = this.categoryService.checkPath(path);

        return valid;
    }
}
