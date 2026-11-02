import type { AuthUser } from '../common/types/auth-user';
import { CreateReportDto, QueryReportsDto, UpdateReportDto, UpdateStatusDto } from './dto/reports.dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportsService);
    create(user: AuthUser, dto: CreateReportDto, file?: Express.Multer.File): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findMine(user: AuthUser, q: QueryReportsDto): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            description: string;
            imageUrl: string;
            latitude: number;
            longitude: number;
            address: string | null;
            category: import("@prisma/client").$Enums.WasteCategory | null;
            aiConfidence: number | null;
            status: import("@prisma/client").$Enums.ReportStatus;
            adminNote: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findAll(q: QueryReportsDto): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            description: string;
            imageUrl: string;
            latitude: number;
            longitude: number;
            address: string | null;
            category: import("@prisma/client").$Enums.WasteCategory | null;
            aiConfidence: number | null;
            status: import("@prisma/client").$Enums.ReportStatus;
            adminNote: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: AuthUser): Promise<{
        statusLogs: ({
            changedBy: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            fromStatus: import("@prisma/client").$Enums.ReportStatus | null;
            toStatus: import("@prisma/client").$Enums.ReportStatus;
            note: string | null;
            changedById: string | null;
            reportId: string;
        })[];
        user: {
            id: string;
            name: string;
            email: string;
        };
        logs: ({
            changedBy: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            fromStatus: import("@prisma/client").$Enums.ReportStatus | null;
            toStatus: import("@prisma/client").$Enums.ReportStatus;
            note: string | null;
            changedById: string | null;
            reportId: string;
        })[];
        id: string;
        description: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    updateStatus(id: string, user: AuthUser, dto: UpdateStatusDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, user: AuthUser, dto: UpdateReportDto, file?: Express.Multer.File): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, user: AuthUser): Promise<{
        message: string;
    }>;
}
