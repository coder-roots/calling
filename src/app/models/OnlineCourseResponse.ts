export interface OnlineCourseResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    OnlineCourse[];
}

export interface OnlineCourse {
    _id?:          string;
    autoId?:       string;
    name?:         string;
    description?:  string;
    author?:       string;
    lectureCount?: number;
    slug?:         string;
    isImage?:      boolean;
    image?:        string;
    isActive?:     boolean;
    price?:        number;
    addedById?:    string;
    status?:       boolean;
    createdAt?:    Date;
    __v?:          number;
    lectures?:     Lecture[];
    isDelete?:     boolean;
}

export interface Lecture {
    lectureId?: string;
    _id?:       string;
}

export interface OnlineCourseLectureResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    OnlineCourseLecture[];
}

export interface OnlineCourseLecture {
    _id?:             string;
    autoId?:          string;
    courseId?:        string;
    title?:           string;
    slug?:            string;
    theory?:          string;
    isVisualContent?: boolean;
    contentFile?:     string;
    isDelete?:        boolean;
    addedById?:       string;
    status?:          boolean;
    createdAt?:       Date;
    __v?:             number;
}

export interface OnlineCourseOrderResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    OnlineCourseOrder[];
}

export interface OnlineCourseOrder {
    _id?:                 string;
    autoId?:              string;
    courseId?:            string;
    customerId?:          string;
    amountPaid?:          number;
    transactionId?:       string;
    isPaymentSuccessful?: boolean;
    addedById?:           string;
    status?:              boolean;
    createdAt?:           Date;
    __v?:                 number;
}
