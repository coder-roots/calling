export interface FlashNewsResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    FlashNews[];
}

export interface FlashNews {
    _id?:            string;
    autoId?:         string;
    title?:          string;
    content?:        string;
    slug?:           string;
    image?:          string;
    trimImage?:      string;
    isNotification?: boolean;
    publishStatus?:  boolean;
    isPremium?:      boolean;
    isDelete?:       boolean;
    isPreviousData?: boolean;
    entryByPrev?:    string;
    entryDatePrev?:  Date;
    addedById?:      string;
    updatedById?:    null;
    updatedAt?:      null;
    status?:         boolean;
    updateLogs?:     any[];
    createdAt?:      Date;
    __v?:            number;
}

