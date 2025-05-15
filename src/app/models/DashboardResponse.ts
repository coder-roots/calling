export interface DashboardResponse {
    success: boolean;
    status: number;
    message: string;
    totalNews: number;
    totalPendingNews: number;
    totalPublishedNews: number;
    totalRejectedNews: number;
    totalCutShorts: number;
    totalBreaking: number;
    totalWebStories: number;
    totalPodcasts: number;
    todayNews: number;
    todayPendingNews: number;
    todayPublishedNews: number;
    todayRejectedNews: number;
    todayCutShorts: number;
    todayBreaking: number;
    todayWebStories: number;
    todayPodcasts: number;
}
