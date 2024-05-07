export type TSubscription = {
    id: number;
    externalId: string;
    userId: number;
    status: string;
    amount: number;
    nextTransactionAt: Date;
};
