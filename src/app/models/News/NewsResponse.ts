export interface AllNewsResponse {
    success: boolean;
    status: number;
    message: string;
    total: number;
    data: News[];
}
export interface SingleNewsResponse {
    success: boolean;
    status: number;
    message: string;
    data: News;
}


export interface News {
    cutShortDetails: CutShortDetails;
    seoDetails: SEODetails;
    imageAlt: string;
    alsoReadNews: any;
    _id: string;
    autoId: string;
    prevId: string;
    newsCode: string;
    title: string;
    shortDescription: string;
    content: string;
    slug: string;
    images: string[];
    sponsoredBadge: string;
    videoUrl: string;
    articleFiles: string[];
    newsAttachmentTitle: string;
    author?: Author;
    isHomePageTrending: boolean;
    isPremium: boolean;
    isNotification: boolean;
    isFeatured: boolean;
    isInstagram: boolean;
    isSponsored: boolean;
    isPhoto: boolean;
    isVideo: boolean;
    isTopNews: boolean;
    isTrending: boolean;
    isBreaking: boolean;
    isFeaturedImage: boolean;
    isFeaturedVideo: boolean;
    hasCutShort: boolean;
    cutShortId: null | string;
    alsoReadLink?: string;
    alsoReadTitle?: string;
    alsoReadPosition: number;
    isDelete: boolean;
    publishStatus: number;
    publishDate: Date;
    isPublished: boolean;
    isActive: boolean;
    isPreviousData: boolean;
    entryDatePrev: null;
    entryByPrev: string;
    prevAuthor: string;
    updatedAt: Date | null;
    addedById: any;
    updatedById: any;
    categories: Category[];
    subCategories: SubCategory[];
    relatedNews: RelatedNews[];
    updateLogs: UpdateLog[];
    createdAt: Date;
    isHomePageNews: boolean;
    homePagePosition: number;
    embedType: number;
    isEmbedVideo: boolean;
    __v: number;
}

export interface Category {
    categoryId: any;
    _id: string;
}


export interface CutShortDetails {
    image: string;
    trimImage: string;
    title: string;
    description: string;
}

export interface RelatedNews {
    newsId: any;
    _id: string;
}

export interface SEODetails {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    schema: string;
    tags: string[];
}

export interface SubCategory {
    subCategoryId: any;
    _id: string;
}

export interface UpdateLog {
    prevTitle: string;
    prevSlug: string;
    prevShortDescription: string;
    prevContent: string;
    publishDate: Date;
    publishStatus: number;
    isActive: boolean;
    isPremium: boolean;
    updatedById: any;
    _id: string;
    updatedAt: Date;
}

export interface Author{
    name?: string,
    _id?: string
}
