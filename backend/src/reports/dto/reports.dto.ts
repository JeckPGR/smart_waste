import { PartialType } from '@nestjs/swagger';
import { ReportStatus, WasteCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateReportDto {
    @IsOptional() @IsString()
    description?: string;

    @Type(() => Number) @IsNumber() @Min(-90) @Max(90)
    latitude!: number;

    @Type(() => Number) @IsNumber() @Min(-180) @Max(180)
    longitude!: number;

    @IsOptional() @IsString() address?: string;
    @IsOptional() @IsEnum(WasteCategory) category?: WasteCategory;

    @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1)
    aiConfidence?: number;
}

export class UpdateReportDto extends PartialType(CreateReportDto) { }

export class UpdateStatusDto {
    @IsEnum(ReportStatus) status!: ReportStatus;
    @IsOptional() @IsString() note?: string;
}

export class QueryReportsDto extends PaginationDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @IsEnum(ReportStatus) status?: ReportStatus;
    @IsOptional() @IsEnum(WasteCategory) category?: WasteCategory;
    @IsOptional() @IsUUID() userId?: string;
    @IsOptional() @IsDateString() dateFrom?: string;
    @IsOptional() @IsDateString() dateTo?: string;

    @IsOptional() @IsIn(['createdAt', 'updatedAt', 'status'])
    sortBy: 'createdAt' | 'updatedAt' | 'status' = 'createdAt';

    @IsOptional() @IsIn(['asc', 'desc'])
    order: 'asc' | 'desc' = 'desc';
}
