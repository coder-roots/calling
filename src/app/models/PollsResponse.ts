export interface PollsResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Polls[];
}

export interface Polls {
    isActive?:         boolean;
    _id?:              string;
    autoId?:           string;
    slug?:             string;
    shortDescription?: string;
    question?:         string;
    isImageQuestion?:  boolean;
    image?:            string;
    trimImage?:        string;
    totalAttempts?:    number;
    publishStatus?:    boolean;
    publishDate?:      Date;
    isDelete?:         boolean;
    updatedAt?:        Date;
    addedById?:        string;
    updatedById?:      string;
    status?:           boolean;
    options?:          Option[];
    updateLogs?:       UpdateLog[];
    createdAt?:        Date;
    __v?:              number;
}

export interface Option {
    optionId?: string;
    _id?:      string;
}

export interface UpdateLog {
    prevQuestion?:         string;
    prevShortDescription?: string;
    prevSlug?:             string;
    publishStatus?:        boolean;
    updatedById?:          string;
    _id?:                  string;
    updatedAt?:            Date;
}
