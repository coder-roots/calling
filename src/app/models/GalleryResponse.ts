export interface GalleryResponse {
    status?:  number;
    success?: boolean;
    message?: string;
    total?:   number;
    data?:    Gallery[];
}

export interface Gallery {
    autoId?:        string;
    title?:         string;
    slug?:          string;
    images?:        Image[];
    publishStatus?: boolean;
    isPremium?:     boolean;
    isDelete?:      boolean;
    addedById?:     string;
    updatedById?:   null;
    updatedAt?:     null;
    status?:        boolean;
    _id?:           string;
    createdAt?:     Date;
    __v?:           number;
}

export interface Image {
    image?: string;
    name?:  string;
    _id?:   string;
}
