import { httpClient } from '@/shared/lib/http-client';
import {
    DashboardStats,
    DashboardTrendItem,
    UserDashboardStats,
} from '../types/dashboard.types';

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        return httpClient<DashboardStats>('/dashboard/stats');
    },

    getTrend: async (days = 7): Promise<DashboardTrendItem[]> => {
        return httpClient<DashboardTrendItem[]>(`/dashboard/trend?days=${days}`);
    },

    getMyStats: async (): Promise<UserDashboardStats> => {
        return httpClient<UserDashboardStats>('/dashboard/me');
    },
};

