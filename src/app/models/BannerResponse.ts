export interface BannerResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Banner[];
}

export interface Banner {
    _id?:       string;
    autoId?:    string;
    image?:     string;
    trimImage?: string;
    imageAlt?:  string;
    isActive?:  boolean;
    isDelete?:  boolean;
    updatedAt?: null;
    status?:    boolean;
    createdAt?: Date;
    __v?:       number;
}
