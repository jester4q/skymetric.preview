import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { LoggerMiddleware } from './common/log/logger.middleware';
import { ProxySettingModule } from './proxy-setting/proxy-setting.module';
import { UserModule } from './user/user.module';
import { DbOrmModule } from './common/db/orm.config';
import { TrackingModule } from './tracking/tracking.module';
import { ProductDetailsModule } from './product-details/product.details.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { TariffModule } from './tariff/tariff.module';
import { PaymentModule } from './payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionModule } from './subscription/subscription.module';
import { EntityChangeSubscriber } from './common/db/entities/entity';
import { CategoryDetailsModule } from './category-details/category.details.module';

@Module({
    imports: [
        DbOrmModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        UserModule,
        ProxySettingModule,
        CategoryModule,
        CategoryDetailsModule,
        ProductModule,
        TrackingModule,
        ProductDetailsModule,
        TariffModule,
        PaymentModule,
        SubscriptionModule,
    ],
    providers: [EntityChangeSubscriber],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes('/api/*');
    }
}
