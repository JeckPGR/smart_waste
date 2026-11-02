import { ReportStatus, WasteCategory } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CreateReportDto {
    description?: string;
    latitude: number;
    longitude: number;
    address?: string;
    category?: WasteCategory;
    aiConfidence?: number;
}
declare const UpdateReportDto_base: import("@nestjs/common", { with: { "resolution-mode": "import" } }).Type<Partial<CreateReportDto>>;
export declare class UpdateReportDto extends UpdateReportDto_base {
}
export declare class UpdateStatusDto {
    status: ReportStatus;
    note?: string;
}
export declare class QueryReportsDto extends PaginationDto {
    search?: string;
    status?: ReportStatus;
    category?: WasteCategory;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy: 'createdAt' | 'updatedAt' | 'status';
    order: 'asc' | 'desc';
}
export {};
