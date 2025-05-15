export interface CustomerResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Customers[];
}

export interface Customers {
    _id?:               string;
    autoId?:            string;
    name?:              string;
    userId?:            UserID;
    city?:              string;
    address?:           string;
    pinCode?:           string;
    isPremium?:         boolean;
    premiumExpiryDate?: null;
    isDelete?:          boolean;
    addedById?:         string;
    updatedById?:       null;
    updatedAt?:         null;
    status?:            boolean;
    createdAt?:         Date;
    __v?:               number;
}


export interface UserID {
    _id?:         string;
    name?:        string;
    email?:       string;
    countryCode?: number;
    phone?:       string;
    image?:       string;
    trimImage?:   string;
}

