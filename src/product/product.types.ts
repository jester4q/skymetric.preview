export type TProduct = {
    id: number;
    code: string;
    title: string;
    url: string;
    unitPrice: number;
    creditMonthlyPrice: number;
    offersQuantity: number;
    reviewsQuantity: number;
    ratingQuantity: number;
    description: string;
    specification: TProductSpecification[];
    galleryImages: TProductImage[];
    lastCheckedAt: Date;
    productRating: number;
    brand: string;
    weight: string;
    kaspiCreatedAt: Date;
    revenue: number;
};

export type TCategoryProduct = {
    id: number;
    code: string;
    title: string;
    url: string;
    checked: boolean;
    offersChecked: boolean;
    promoConditions: any;
};

export type TCategoryPath = {
    level1: number;
    level2: number;
    level3?: number;
    level4?: number;
    level5?: number;
    level6?: number;
};

export type TCategoryName = {
    level1: string;
    level2: string;
    level3?: string;
    level4?: string;
    level5?: string;
    level6?: string;
};

export type TCategoryUrls = {
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level5?: string;
    level6?: string;
};

export type TProductImage = {
    large: string;
    medium: string;
    small: string;
};

export type TProductSpecification = {
    name: string;
    value: string;
};

export type TProductSeller = {
    name: string;
    price: number;
    id: string;
    url: string;
};

/*
export type TProductReview = {
    author: string;
    date: Date | null;
    rating: number;
    externalId: string;
};
*/
