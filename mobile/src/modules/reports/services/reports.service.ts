import { ApiClient } from '@/shared/services/api-client';

export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type WasteCategory = 'ORGANIC' | 'PLASTIC' | 'PAPER';

export interface ReportStatusLog {
    id: string;
    reportId: string;
    fromStatus: ReportStatus | null;
    toStatus: ReportStatus;
    note?: string | null;
    changedById?: string | null;
    changedBy?: { id: string; name: string } | null;
    createdAt: string;
}

export interface Report {
    id: string;
    userId: string;
    description: string;
    category?: WasteCategory | null;
    latitude: number;
    longitude: number;
    address?: string | null;
    imageUrl: string;
    status: ReportStatus;
    aiConfidence?: number | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
    };
    logs?: ReportStatusLog[];
    statusLogs?: ReportStatusLog[];
}

export interface PaginatedReports {
    data: Report[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AiPredictionResponse {
    label: string;
    category: WasteCategory;
    confidence: number;
    probabilities: Record<string, number>;
    mock: boolean;
}

export const ReportsService = {
    async listMine(params: {
        page?: number;
        limit?: number;
        status?: ReportStatus;
        category?: WasteCategory;
        search?: string;
    } = {}): Promise<PaginatedReports> {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);
        if (params.category) query.append('category', params.category);
        if (params.search) query.append('search', params.search);

        const qs = query.toString();
        return ApiClient.get<PaginatedReports>(`/reports/my${qs ? `?${qs}` : ''}`);
    },

    async getDetail(id: string): Promise<Report> {
        return ApiClient.get<Report>(`/reports/${id}`);
    },

    async create(formData: FormData): Promise<Report> {
        return ApiClient.post<Report>('/reports', formData);
    },

    async predictAi(formData: FormData): Promise<AiPredictionResponse> {
        return ApiClient.post<AiPredictionResponse>('/ai/predict', formData);
    },

    async delete(id: string): Promise<{ success: boolean }> {
        return ApiClient.delete<{ success: boolean }>(`/reports/${id}`);
    },
};

