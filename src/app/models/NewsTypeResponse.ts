export interface NewsTypeResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    NewsType[];
}

export interface NewsType {
    _id?:         string;
    autoId?:      string;
    name?:        string;
    isDelete?:    boolean;
    updatedAt?:   Date | null;
    addedById?:   string;
    updatedById?: null | string;
    status?:      boolean;
    createdAt?:   Date;
    __v?:         number;
}
