import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../common/db/entities';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
    imports: [TypeOrmModule.forFeature([Subscription]), PaymentModule],
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
})
export class SubscriptionModule {}
