export interface AllNewsLetterSubscriberResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: NewsLetterSubscriber[];
}

export interface SingleNewsLetterSubscriberResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: NewsLetterSubscriber;
}


export interface NewsLetterSubscriber {
    _id: string;
    autoId: string;
    email: string;
    isPremium: boolean;
    isActive: boolean;
    addedFrom: number;
    updatedAt: null;
    addedById: string;
    updatedById: null;
    status: boolean;
    createdAt: Date;
    __v: number;
}
