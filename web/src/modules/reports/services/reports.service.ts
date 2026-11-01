import { httpClient } from '@/shared/lib/http-client';
import {
    AiPredictResponse,
    PaginatedResponse,
    QueryReportsParams,
    Report,
    ReportStatus,
} from '../types/reports.types';

export const reportsService = {
    list: async (params: QueryReportsParams = {}): Promise<PaginatedResponse<Report>> => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page.toString());
        if (params.limit) query.set('limit', params.limit.toString());
        if (params.search) query.set('search', params.search);
        if (params.status) query.set('status', params.status);
        if (params.category) query.set('category', params.category);
        if (params.sortBy) query.set('sortBy', params.sortBy);
        if (params.order) query.set('order', params.order);
        if (params.dateFrom) query.set('dateFrom', params.dateFrom);
        if (params.dateTo) query.set('dateTo', params.dateTo);
        if (params.userId) query.set('userId', params.userId);
        return httpClient<PaginatedResponse<Report>>(`/reports?${query.toString()}`);
    },

    listMine: async (params: QueryReportsParams = {}): Promise<PaginatedResponse<Report>> => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page.toString());
        if (params.limit) query.set('limit', params.limit.toString());
        if (params.search) query.set('search', params.search);
        if (params.status) query.set('status', params.status);
        if (params.category) query.set('category', params.category);
        if (params.sortBy) query.set('sortBy', params.sortBy);
        if (params.order) query.set('order', params.order);
        return httpClient<PaginatedResponse<Report>>(`/reports/my?${query.toString()}`);
    },

    get: async (id: string): Promise<Report> => {
        return httpClient<Report>(`/reports/${id}`);
    },

    create: async (formData: FormData): Promise<Report> => {
        return httpClient<Report>('/reports', {
            method: 'POST',
            body: formData,
        });
    },

    update: async (id: string, formData: FormData): Promise<Report> => {
        return httpClient<Report>(`/reports/${id}`, {
            method: 'PATCH',
            body: formData,
        });
    },

    updateStatus: async (
        id: string,
        payload: { status: ReportStatus; note?: string },
    ): Promise<Report> => {
        return httpClient<Report>(`/reports/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return httpClient<{ message: string }>(`/reports/${id}`, {
            method: 'DELETE',
        });
    },

    predictAi: async (formData: FormData): Promise<AiPredictResponse> => {
        return httpClient<AiPredictResponse>('/ai/predict', {
            method: 'POST',
            body: formData,
        });
    },
};

