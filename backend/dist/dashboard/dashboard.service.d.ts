import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    stats(): Promise<{
        totalReports: number;
        totalUsers: number;
        byStatus: Record<string, number>;
        byCategory: Record<string, number>;
    }>;
    trend(days: number): Promise<{
        date: string;
        count: number;
    }[]>;
    me(userId: string): Promise<{
        totalReports: number;
        byStatus: Record<string, number>;
    }>;
}
