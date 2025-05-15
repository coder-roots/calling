export interface CutShortResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    CutShort[];
}

export interface CutShort {
    publishDate?:   Date | null;
    _id?:           string;
    autoId?:        string;
    title?:         string;
    content?:       string;
    image?:         string;
    trimImage?:     string;
    publishStatus?: boolean;
    slug?:          string;
    isPremium?:     boolean;
    isDelete?:      boolean;
    addedById?:     string;
    updatedById?:   null;
    updatedAt?:     null;
    status?:        boolean;
    createdAt?:     Date;
    __v?:           number;
}
