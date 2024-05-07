export type TCategory = {
    id: number;
    parentId: number;
    name: string;
    level: number;
    url: string;
    children?: TCategory[];
};

export type TSimpleCategory = {
    id: number;
    name: string;
    children?: TSimpleCategory[];
};
