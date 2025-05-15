export interface WebStoryContentResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    WebStoryContent[];
}

export interface WebStoryContent {
    _id?:                string;
    autoId?:             string;
    webStoryId?:         string;
    prevWebId?:          string;
    title?:              string;
    description?:        string;
    image?:              string;
    trimImage?:          string;
    isQuiz?:             boolean;
    question?:           string;
    option1?:            string;
    option2?:            string;
    isOption1Correct?:   boolean;
    totalAttempts?:      number;
    option1SelectCount?: number;
    option2SelectCount?: number;
    isDelete?:           boolean;
    status?:             boolean;
    updatedAt?:          string;
    addedById?:          string;
    updatedById?:        string;
    createdAt?:          Date;
    __v?:                number;
}
