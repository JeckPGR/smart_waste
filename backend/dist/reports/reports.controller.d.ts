import type { AuthUser } from '../common/types/auth-user';
import { CreateReportDto, QueryReportsDto, UpdateReportDto, UpdateStatusDto } from './dto/reports.dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportsService);
    create(user: AuthUser, dto: CreateReportDto, file?: Express.Multer.File): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        userId: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
    }>;
    findMine(user: AuthUser, q: QueryReportsDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            userId: string;
            imageUrl: string;
            latitude: number;
            longitude: number;
            address: string | null;
            category: import("@prisma/client").$Enums.WasteCategory | null;
            aiConfidence: number | null;
            status: import("@prisma/client").$Enums.ReportStatus;
            adminNote: string | null;
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
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            userId: string;
            imageUrl: string;
            latitude: number;
            longitude: number;
            address: string | null;
            category: import("@prisma/client").$Enums.WasteCategory | null;
            aiConfidence: number | null;
            status: import("@prisma/client").$Enums.ReportStatus;
            adminNote: string | null;
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
            note: string | null;
            fromStatus: import("@prisma/client").$Enums.ReportStatus | null;
            toStatus: import("@prisma/client").$Enums.ReportStatus;
            changedById: string | null;
            reportId: string;
        })[];
        user: {
            id: string;
            email: string;
            name: string;
        };
        logs: ({
            changedBy: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            note: string | null;
            fromStatus: import("@prisma/client").$Enums.ReportStatus | null;
            toStatus: import("@prisma/client").$Enums.ReportStatus;
            changedById: string | null;
            reportId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        userId: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
    }>;
    updateStatus(id: string, user: AuthUser, dto: UpdateStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        userId: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
    }>;
    update(id: string, user: AuthUser, dto: UpdateReportDto, file?: Express.Multer.File): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        userId: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        address: string | null;
        category: import("@prisma/client").$Enums.WasteCategory | null;
        aiConfidence: number | null;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNote: string | null;
    }>;
    remove(id: string, user: AuthUser): Promise<{
        message: string;
    }>;
}
