import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus, Role } from '@prisma/client';
import type { AuthUser } from '../common/types/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateReportDto, QueryReportsDto, UpdateReportDto, UpdateStatusDto } from './dto/reports.dto';

const REPORT_INCLUDE = {
    user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ReportInclude;

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private storage: StorageService,
    ) { }

    async create(userId: string, dto: CreateReportDto, file?: Express.Multer.File) {
        if (!file) throw new BadRequestException('Foto wajib diunggah (field: image)');
        const folder = dto.category ? `${dto.category.toLowerCase()}-waste` : 'reports';
        const imageUrl = await this.storage.save(file, folder);
        return this.prisma.report.create({
            data: {
                userId,
                description: dto.description?.trim() || 'Laporan Sampah',
                latitude: dto.latitude,
                longitude: dto.longitude,
                address: dto.address,
                category: dto.category,
                aiConfidence: dto.aiConfidence,
                imageUrl,
                logs: { create: { changedById: userId, fromStatus: null, toStatus: ReportStatus.PENDING, note: 'Laporan dibuat' } },
            },
            include: REPORT_INCLUDE,
        });
    }

    /** userId diisi => dibatasi laporan milik user itu (untuk /reports/my). */
    async list(q: QueryReportsDto, userId?: string) {
        const where = this.buildWhere(q, userId);
        const orderBy: Prisma.ReportOrderByWithRelationInput =
            q.sortBy === 'status' ? { status: q.order } : q.sortBy === 'updatedAt' ? { updatedAt: q.order } : { createdAt: q.order };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.report.findMany({
                where,
                include: REPORT_INCLUDE,
                orderBy,
                skip: (q.page - 1) * q.limit,
                take: q.limit,
            }),
            this.prisma.report.count({ where }),
        ]);
        return { data, meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } };
    }

    async findOne(id: string, user: AuthUser) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                ...REPORT_INCLUDE,
                logs: {
                    orderBy: { createdAt: 'desc' },
                    include: { changedBy: { select: { id: true, name: true } } },
                },
            },
        });
        if (!report) throw new NotFoundException('Laporan tidak ditemukan');
        if (user.role !== Role.ADMIN && report.userId !== user.id) throw new ForbiddenException('Bukan laporan Anda');
        return {
            ...report,
            statusLogs: report.logs,
        };
    }

    async update(id: string, user: AuthUser, dto: UpdateReportDto, file?: Express.Multer.File) {
        const report = await this.getReport(id);
        this.assertCanModify(report, user);

        const data: Prisma.ReportUpdateInput = { ...dto };
        if (file) {
            const cat = dto.category ?? report.category;
            const folder = cat ? `${cat.toLowerCase()}-waste` : 'reports';
            data.imageUrl = await this.storage.save(file, folder);
        }

        const updated = await this.prisma.report.update({ where: { id }, data, include: REPORT_INCLUDE });
        if (file) await this.storage.remove(report.imageUrl);
        return updated;
    }

    async remove(id: string, user: AuthUser) {
        const report = await this.getReport(id);
        this.assertCanModify(report, user);
        await this.prisma.report.delete({ where: { id } });
        await this.storage.remove(report.imageUrl);
        return { message: 'Laporan dihapus' };
    }

    async updateStatus(id: string, adminId: string, dto: UpdateStatusDto) {
        const report = await this.getReport(id);
        if (report.status === dto.status) throw new BadRequestException('Status tidak bisa sama dengan sebelumnya!');

        const [updated] = await this.prisma.$transaction([
            this.prisma.report.update({
                where: { id },
                data: { status: dto.status, adminNote: dto.note },
                include: REPORT_INCLUDE,
            }),
            this.prisma.reportStatusLog.create({
                data: { reportId: id, changedById: adminId, fromStatus: report.status, toStatus: dto.status, note: dto.note },
            }),
        ]);
        return updated;
    }

    // ---------- helper ----------
    private async getReport(id: string) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Laporan tidak ditemukan');
        return report;
    }

    private assertCanModify(report: { userId: string; status: ReportStatus }, user: AuthUser) {
        if (user.role === Role.ADMIN) return;
        if (report.userId !== user.id) throw new ForbiddenException('Bukan laporan Anda');
        if (report.status !== ReportStatus.PENDING) {
            throw new ForbiddenException('Laporan yang sudah diproses tidak bisa diubah');
        }
    }

    private buildWhere(q: QueryReportsDto, userId?: string): Prisma.ReportWhereInput {
        const where: Prisma.ReportWhereInput = {};
        const owner = userId ?? q.userId;
        if (owner) where.userId = owner;
        if (q.status) where.status = q.status;
        if (q.category) where.category = q.category;

        if (q.dateFrom || q.dateTo) {
            const range: Prisma.DateTimeFilter = {};
            if (q.dateFrom) range.gte = new Date(q.dateFrom);
            if (q.dateTo) range.lte = new Date(q.dateTo.length === 10 ? `${q.dateTo}T23:59:59.999Z` : q.dateTo);
            where.createdAt = range;
        }
        if (q.search) {
            where.OR = [
                { description: { contains: q.search, mode: 'insensitive' } },
                { address: { contains: q.search, mode: 'insensitive' } },
                { user: { name: { contains: q.search, mode: 'insensitive' } } },
            ];
        }
        return where;
    }
}