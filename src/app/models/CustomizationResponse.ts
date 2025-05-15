export interface AllCustomizationResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: Customization[];
}
export interface SingleCustomizationResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: Customization;
}
export interface Customization {
    _id: string;
    autoId: string;
    key: string;
    value: string;
    values: any[];
    isArrayValues: boolean;
    isDelete: boolean;
    updatedAt: Date | null;
    addedById: string;
    updatedById: null | string;
    status: boolean;
    createdAt: Date;
    __v: number;
}
