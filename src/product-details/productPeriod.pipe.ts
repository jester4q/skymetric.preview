import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

export class ProductPeriodPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            throw new BadRequestException('Period is not defined');
        }

        if (!this.isNumeric(value)) {
            throw new BadRequestException('Period is not right format');
        }
        const period = parseInt(value, 10);

        if (isNaN(period) || period < 1) {
            throw new BadRequestException('Period is not right formt');
        }

        return period;
    }

    private isNumeric(value: any) {
        return ['string', 'number'].includes(typeof value) && /^-?\d+$/.test(value) && isFinite(value);
    }
}
