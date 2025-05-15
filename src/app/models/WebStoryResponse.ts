export interface WebStoryResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    WebStory[];
}

export interface WebStory {
    _id?:           string;
    autoId?:        string;
    prevId?:        string;
    title?:         string;
    slug?:          string;
    keywords?:      string;
    isQuizStory?:   boolean;
    entryDatePrev?: Date;
    isPremium?:     boolean;
    isDelete?:      boolean;
    publishStatus?: boolean;
    updatedAt?:     null;
    addedById?:     string;
    updatedById?:   null;
    contents?:      Content[];
    createdAt?:     Date;
    __v?:           number;
    updateLogs?:    any[];
}


export interface Content {
    contentId?: string;
    _id?:       string;
}
