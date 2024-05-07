import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tariff } from '../common/db/entities';
import { TAddTariff, TPatchTariff, TTariff } from './tariff.types';
import { NotFoundApiError } from '../common/error';

@Injectable()
export class TariffService {
    constructor(
        @InjectRepository(Tariff)
        private tariffRepository: Repository<Tariff>,
    ) {}

    public async fetchAll(): Promise<TTariff[]> {
        const where: any = {
            status: 1,
        };

        const tariffs: Tariff[] = await this.tariffRepository.find(where);
        if (!tariffs.length) {
            return [];
        }

        return tariffs.map((item: Tariff, i: number) => {
            return this.toTariff(item);
        });
    }

    public async fetchOne(tariffId: number): Promise<TTariff> {
        const tariff = await this.tariffRepository.findOneBy({ id: tariffId });
        if (!tariff) {
            throw new NotFoundApiError(
                'Could not find tariff by id ' + tariffId,
            );
        }
        return (tariff && this.toTariff(tariff)) || null;
    }

    async add(data: TAddTariff): Promise<TTariff> {
        const tariff = this.tariffRepository.create(data);
        await tariff.save();
        return this.toTariff(tariff);
    }

    async update(tariffId: number, data: TPatchTariff): Promise<TTariff> {
        const tariff = await this.tariffRepository.findOneBy({ id: tariffId });
        if (!tariff) {
            throw new NotFoundApiError(
                'Could not find tariff by id ' + tariffId,
            );
        }
        if (data.name) {
            tariff.name = data.name;
        }
        if (data.role) {
            tariff.role = data.role;
        }
        if (data.price) {
            tariff.price = data.price;
        }
        if (data.months) {
            tariff.months = data.months;
        }
        await tariff.save();
        return this.toTariff(tariff);
    }

    public async delete(tariffId: number): Promise<boolean> {
        const proxy = await this.tariffRepository.update(
            { id: tariffId },
            {
                status: 0,
            },
        );
        return proxy.affected > 0;
    }

    protected toTariff(tariff: Tariff): TTariff {
        return {
            id: tariff.id,
            role: tariff.role,
            name: tariff.name,
            months: tariff.months,
            price: tariff.price,
        };
    }
}
