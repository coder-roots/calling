export interface EventResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Event[];
}

export interface Event {
    _id?:                string;
    autoId?:             string;
    customerId?:         string;
    organisedByCompany?: string;
    organiserName?:      string;
    eventDate?:          Date;
    location?:           string;
    email?:              string;
    phone?:              string;
    referredBy?:         string;
    eventDetail?:        string;
    eventStatus?:        number;
    updatedAt?:          Date;
    addedById?:          string;
    updatedById?:        string;
    status?:             boolean;
    createdAt?:          Date;
    __v?:                number;
}
