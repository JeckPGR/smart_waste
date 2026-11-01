import type { AuthUser } from '../common/types/auth-user';
import { DashboardService } from './dashboard.service';
import { TrendQueryDto } from './dto/dashboard.dto';
export declare class DashboardController {
    private dashboard;
    constructor(dashboard: DashboardService);
    stats(): Promise<{
        totalReports: number;
        totalUsers: number;
        byStatus: Record<string, number>;
        byCategory: Record<string, number>;
    }>;
    trend(q: TrendQueryDto): Promise<{
        date: string;
        count: number;
    }[]>;
    me(user: AuthUser): Promise<{
        totalReports: number;
        byStatus: Record<string, number>;
    }>;
}
