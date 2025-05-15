export interface AllNewsLetterResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: NewsLetter[];
}

export interface NewsLetter {
    _id: string;
    autoId: string;
    title: string;
    content: string;
    isPremium: boolean;
    addedById: string;
    status: boolean;
    createdAt: Date;
    __v: number;
}
export interface SingleNewsLetterResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: NewsLetter;
}


