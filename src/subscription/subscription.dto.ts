import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDTO {
    @ApiProperty({
        description: 'Subscription status',
    })
    status: string;

    @ApiProperty({
        description: 'Next payment amount',
    })
    amount: number;

    @ApiProperty({
        description: 'Next payment date',
    })
    nextTransactionAt: Date;
}
