export interface PollOptionResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    PollOption[];
}

export interface PollOption {
    _id?:              string;
    pollId?:           string;
    text?:             string;
    isImageOption?:    boolean;
    image?:            string;
    trimImage?:        string;
    totalSelectCount?: number;
    isDelete?:         boolean;
    updatedAt?:        null;
    addedById?:        string;
    updatedById?:      null;
    status?:           boolean;
    updateLogs?:       any[];
    createdAt?:        Date;
    __v?:              number;
}
