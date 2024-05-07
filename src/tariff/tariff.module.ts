import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffController } from './tariff.controller';
import { TariffService } from './tariff.service';
import { Tariff } from '../common/db/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Tariff])],
    controllers: [TariffController],
    providers: [TariffService],
})
export class TariffModule {}
