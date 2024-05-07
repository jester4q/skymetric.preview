import { Injectable, Logger } from '@nestjs/common';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../common/db/entities';
import { TSubscription } from './types';
import { CloudPaymentService } from '../payment/cloudpayment.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRoleEnum } from '../user/types';

@Injectable()
export class SubscriptionService {
    private logger = new Logger('subscription-service-job');
    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        private cloudpaymentService: CloudPaymentService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        const to = new Date();
        to.setHours(23);
        to.setMinutes(59);
        to.setSeconds(59);
        const result = await this.subscriptionRepository.find({
            relations: { user: true },
            where: {
                status: 'WillBeCancelled',
                nextTransactionAt: LessThanOrEqual(to),
            },
        });
        for (const item of result) {
            item.status = 'Cancelled';
            const user = item.user;
            if (user.roles.includes(UserRoleEnum.premiumUser)) {
                user.roles = [UserRoleEnum.siteUser];
                await user.save();
            }
            await item.save();
        }

        this.logger.log(
            'UPDATE Subscription status: ' +
                JSON.stringify(result.map((i) => i.id)),
        );
    }

    async getActive(userId: number): Promise<TSubscription> {
        const subscription = await this.subscriptionRepository.findOne({
            where: {
                userId: userId,
                status: In(['Active', 'PastDue', 'WillBeCancelled']),
            },
            order: { id: 'DESC' },
        });
        return (subscription && this.toSubscription(subscription)) || null;
    }

    async cancel(subscription: TSubscription) {
        await this.cloudpaymentService.cancel(subscription);
        return this.getActive(subscription.userId);
    }

    protected toSubscription(subscription: Subscription): TSubscription {
        return {
            id: subscription.id,
            externalId: subscription.externalId,
            userId: subscription.userId,
            status: subscription.status,
            amount: subscription.amount,
            nextTransactionAt: subscription.nextTransactionAt,
        };
    }
}
