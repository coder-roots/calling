export interface PremiumPlanResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    PremiumPlan[];
}

export interface PremiumPlan {
    _id?:          string;
    autoId?:       string;
    name?:         string;
    description?:  string;
    price?:        number;
    validityDays?: number;
    isDelete?:     boolean;
    updatedAt?:    Date;
    addedById?:    string;
    status?:       boolean;
    createdAt?:    Date;
    __v?:          number;
}

export interface PremiumPlanOrderResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    PremiumPlanOrder[];
}

export interface PremiumPlanOrder {
    _id?:                 string;
    autoId?:              string;
    planId?:              string;
    customerId?:          string;
    amountPaid?:          number;
    transactionId?:       string;
    isPaymentSuccessful?: boolean;
    addedById?:           string;
    status?:              boolean;
    createdAt?:           Date;
    __v?:                 number;
}
