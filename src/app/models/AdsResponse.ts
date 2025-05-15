export interface AdsResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Ads[];
}

export interface Ads {
    isPreviousData?: boolean;
    _id?:            string;
    autoId?:         string;
    prevId?:         string;
    image?:          string;
    trimImage?:      string;
    targetUrl?:      string;
    targetFile?:     string;
    endDate?:        Date;
    priorityIndex?:  number;
    publishStatus?:  boolean;
    advType?:        number;
    isDelete?:       boolean;
    entryByPrev?:    string;
    entryDatePrev?:  Date;
    updatedAt?:      null;
    addedById?:      string;
    updatedById?:    null;
    createdAt?:      Date;
    __v?:            number;
}
