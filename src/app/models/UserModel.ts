import { Role } from "./RolesResponse";

export interface UserModel {
    token?:   string;
    status?:  number;
    success?: boolean;
    message?: string;
    total?:   number;
    data?:    Data;
}

export interface Data {
    socialLinks?:   SocialLinks;
    countryCode?:   number;
    trimImage?:     string;
    _id?:           string;
    userAutoId?:    number;
    name?:          string;
    email?:         string;
    phone?:         string;
    password?:      string;
    image?:         string;
    userType?:      number;
    bioDetail?:     string;
    role?:          Role;
    isDelete?:      boolean;
    isBlocked?:     boolean;
    addedById?:     null;
    updatedById?:   null;
    updatedAt?:     null;
    status?:        boolean;
    createdAt?:     Date;
    __v?:           number;
    recentLogins?:  RecentLog[];
    recentLogouts?: RecentLog[];
}

export interface RecentLog {
    userAgent?:  string;
    ip?:         string;
    _id?:        string;
    loginTime?:  Date;
    logoutTime?: Date;
}

export interface SocialLinks {
    facebook?:  string;
    instagram?: string;
    whatsapp?:  string;
    twitter?:   string;
    youtube?:   string;
    telegram?:  string;
}

