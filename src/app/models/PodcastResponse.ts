export interface PodcastResponse {
    success?: boolean;
    status?:  number;
    message?: string;
    total?:   number;
    data?:    Podcast[];
}

export interface Podcast {
    slug?:          string;
    _id?:           string;
    autoId?:        string;
    title?:         string;
    description?:   string;
    audioFile?:     string;
    audioDuration?: number;
    image?:         string;
    trimImage?:     string;
    bannerImage?:   string;
    publishStatus?: boolean;
    publishDate?:   Date;
    isPremium?:     boolean;
    isDelete?:      boolean;
    updatedAt?:     null;
    status?:        boolean;
    createdAt?:     Date;
    __v?:           number;
}
