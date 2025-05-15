export interface AllNotificationResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: Notification[];
}
export interface SingleNotificationResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: Notification;
}

export interface Notification {
    _id: string;
    autoId: string;
    title: string;
    description: string;
    isAuto: boolean;
    notificationType: number;
    newsId: null | string;
    flashNewsId: null | string;
    pollId?: null;
    isImage: boolean;
    image: string;
    trimImage: string;
    addedById: null | string;
    status: boolean;
    createdAt: Date;
    __v: number;
}
