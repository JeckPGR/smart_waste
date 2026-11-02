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

export const DashboardService = {
    async getMyStats(): Promise<UserDashboardStats> {
        return ApiClient.get<UserDashboardStats>('/dashboard/me');
    },
};

