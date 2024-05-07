import { UserRoleEnum } from '../user/types';

export type TTariff = {
    id: number;
    role: UserRoleEnum;
    name: string;
    price: number;
    months: number;
};

export type TAddTariff = {
    role: UserRoleEnum;
    name: string;
    price: number;
    months: number;
};

export type TPatchTariff = {
    role?: UserRoleEnum;
    name?: string;
    price?: number;
    months?: number;
};
