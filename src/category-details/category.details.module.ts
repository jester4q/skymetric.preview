import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../common/db/entities';
import { CategoryDetailsController } from './category.details.controller';
import { CategoryDetailsService } from './category.details.service';

@Module({
    imports: [TypeOrmModule.forFeature([Category])],
    controllers: [CategoryDetailsController],
    providers: [CategoryDetailsService],
    exports: [],
})
export class CategoryDetailsModule {}
