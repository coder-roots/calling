export interface CategoryResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Category[];
}

export interface Category {
    slug?:          string;
    _id?:           string;
    autoId?:        string;
    name?:          string;
    image?:         string;
    trimImage?:     string;
    publishStatus?: boolean;
    tags?:          string[];
    isDelete?:      boolean;
    addedById?:     string;
    updatedById?:   string;
    updatedAt?:     Date | null;
    status?:        boolean;
    createdAt?:     Date;
    __v?:           number;
}
