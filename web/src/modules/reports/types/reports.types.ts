export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export type WasteCategory = 'ORGANIC' | 'PLASTIC' | 'PAPER';

export interface ReportStatusLog {
    id: string;
    reportId: string;
    changedById: string;
    fromStatus: ReportStatus | null;
    toStatus: ReportStatus;
    note?: string | null;
    createdAt: string;
    changedBy?: {
        id: string;
        name: string;
    };
}

export interface Report {
    id: string;
    userId: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    category?: WasteCategory | null;
    aiConfidence?: number | null;
    imageUrl: string;
    status: ReportStatus;
    adminNote?: string | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    logs?: ReportStatusLog[];
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface QueryReportsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ReportStatus;
    category?: WasteCategory;
    sortBy?: 'createdAt' | 'updatedAt' | 'status';
    order?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
}

export interface AiPredictResponse {
    label: string;
    category: WasteCategory;
    confidence: number;
    mock: boolean;
}

