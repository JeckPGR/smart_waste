export interface DashboardStats {
    totalReports: number;
    totalUsers: number;
    byStatus: {
        PENDING: number;
        IN_PROGRESS: number;
        COMPLETED: number;
        REJECTED: number;
        [key: string]: number;
    };
    byCategory: {
        ORGANIC: number;
        PLASTIC: number;
        PAPER: number;
        UNCATEGORIZED: number;
        [key: string]: number;
    };
}

export interface DashboardTrendItem {
    date: string;
    count: number;
}

export interface UserDashboardStats {
    totalReports: number;
    byStatus: {
        PENDING: number;
        IN_PROGRESS: number;
        COMPLETED: number;
        REJECTED: number;
        [key: string]: number;
    };
}

