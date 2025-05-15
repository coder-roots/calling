import { RecentLog, SocialLinks } from "./UserModel";

export interface UserResponse {
    status?:  number;
    success?: boolean;
    total?:   number;
    message?: string;
    data?:    Users[];
}

export interface Users {
    socialLinks?:   SocialLinks;
    _id?:           string;
    userAutoId?:    number;
    name?:          string;
    email?:         string;
    phone?:         string;
    password?:      string;
    image?:         string;
    userType?:      number;
    bioDetail?:     string;
    role?:          null | string;
    isDelete?:      boolean;
    isBlocked?:     boolean;
    addedById?:     null | string;
    updatedById?:   null | string;
    updatedAt?:     Date | null;
    status?:        boolean;
    createdAt?:     Date;
    __v?:           number;
    recentLogins?:  RecentLog[];
    recentLogouts?: RecentLog[];
    countryCode?:   number;
    trimImage?:     string;
    otp?:           number;
}


