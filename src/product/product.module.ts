import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
    Product,
    ProductHistory,
    Seller,
    ProductToSeller,
    ProductReview,
} from '../common/db/entities';
import { UserModule } from '../user/user.module';
import { TrackingModule } from '../tracking/tracking.module';
import { ProductListController } from './product.list.controller';

@Module({
    imports: [
        CategoryModule,
        UserModule,
        TrackingModule,
        TypeOrmModule.forFeature([
            Product,
            ProductHistory,
            Seller,
            ProductToSeller,
            ProductReview,
        ]),
    ],
    controllers: [ProductController, ProductListController],
    providers: [ProductService],
})
export class ProductModule {}
