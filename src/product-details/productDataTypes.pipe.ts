import {
    PipeTransform,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import { DataTypesEnum } from './product.details.types';

export class ProductDataTypesPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.length) {
            throw new BadRequestException('Data types is not defined');
        }
        let dataTypes: string[];
        if (Array.isArray(value)) {
            dataTypes = value
                .map((t: string) => t.toLowerCase().trim())
                .filter((t: string) => !!t);
        } else {
            dataTypes = value
                .toLowerCase()
                .split(',')
                .map((t: string) => t.trim())
                .filter((t: string) => !!t);
        }
        if (!dataTypes.length) {
            throw new BadRequestException('Data types is not right format');
        }
        return dataTypes.map((t) => {
            if ((<string[]>Object.values(DataTypesEnum)).indexOf(t) === -1) {
                throw new BadRequestException('Data types is not right format');
            }
            return <DataTypesEnum>t;
        });
    }
}
