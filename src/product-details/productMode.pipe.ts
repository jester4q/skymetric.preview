import {
    PipeTransform,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import { ModeEnum } from './product.details.types';

export class ProductModePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value || !value.length) {
            return ModeEnum.dates;
        }
        if (typeof value !== 'string') {
            throw new BadRequestException('Mode is not right format');
        }

        let mode = value.toLowerCase();

        if (!ModeEnum[mode]) {
            throw new BadRequestException('Mode value is wrong');
        }

        return ModeEnum[mode];
    }
}
