export interface SubcategoryResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Subcategory[];
}

export interface Subcategory {
    slug?:          string;
    _id?:           string;
    autoId?:        string;
    categoryId?:    string;
    name?:          string;
    image?:         string;
    trimImage?:     string;
    publishStatus?: boolean;
    tags?:          string[];
    isDelete?:      boolean;
    addedById?:     string;
    updatedById?:   string;
    updatedAt?:     Date;
    status?:        boolean;
    createdAt?:     Date;
    __v?:           number;
}
