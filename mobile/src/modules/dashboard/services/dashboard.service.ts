import { ApiClient } from '@/shared/services/api-client';

export interface UserDashboardStats {
    totalReports: number;
    byStatus: {
        PENDING: number;
        IN_PROGRESS: number;
        COMPLETED: number;
        REJECTED: number;
    };
}

export interface LeaderboardUser {
    id: string;
    name: string;
    role: string;
    totalReports: number;     // Sampah yang ditemukan
    completedReports: number; // Sampah yang terverifikasi (selesai)
    xp: number;
    level: number;
    rank: number;
    rankBadge: 'GOLD' | 'SILVER' | 'BRONZE' | 'STANDARD';
}

export const DashboardService = {
    async getMyStats(): Promise<UserDashboardStats> {
        return ApiClient.get<UserDashboardStats>('/dashboard/me');
    },

    async getLeaderboard(): Promise<LeaderboardUser[]> {
        return ApiClient.get<LeaderboardUser[]>('/dashboard/leaderboard');
    },
};
