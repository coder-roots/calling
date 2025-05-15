export interface RoleResponse {
    status?:  number;
    success?: boolean;
    total?:   number;
    message?: string;
    data?:    Role[];
}

export interface Role {
    _id?:         string;
    roleAutoId?:  number;
    name?:        string;
    permissions?: string[];
    isDelete?:    boolean;
    addedById?:   string;
    updatedById?: null;
    updatedAt?:   null;
    status?:      boolean;
    createdAt?:   Date;
    __v?:         number;
}
