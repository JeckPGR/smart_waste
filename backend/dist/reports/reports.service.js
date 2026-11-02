"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const REPORT_INCLUDE = {
    user: { select: { id: true, name: true, email: true } },
};
let ReportsService = class ReportsService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async create(userId, dto, file) {
        if (!file)
            throw new common_1.BadRequestException('Foto wajib diunggah (field: image)');
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
                logs: { create: { changedById: userId, fromStatus: null, toStatus: client_1.ReportStatus.PENDING, note: 'Laporan dibuat' } },
            },
            include: REPORT_INCLUDE,
        });
    }
    async list(q, userId) {
        const where = this.buildWhere(q, userId);
        const orderBy = q.sortBy === 'status' ? { status: q.order } : q.sortBy === 'updatedAt' ? { updatedAt: q.order } : { createdAt: q.order };
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
    async findOne(id, user) {
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
        if (!report)
            throw new common_1.NotFoundException('Laporan tidak ditemukan');
        if (user.role !== client_1.Role.ADMIN && report.userId !== user.id)
            throw new common_1.ForbiddenException('Bukan laporan Anda');
        return {
            ...report,
            statusLogs: report.logs,
        };
    }
    async update(id, user, dto, file) {
        const report = await this.getReport(id);
        this.assertCanModify(report, user);
        const data = { ...dto };
        if (file) {
            const cat = dto.category ?? report.category;
            const folder = cat ? `${cat.toLowerCase()}-waste` : 'reports';
            data.imageUrl = await this.storage.save(file, folder);
        }
        const updated = await this.prisma.report.update({ where: { id }, data, include: REPORT_INCLUDE });
        if (file)
            await this.storage.remove(report.imageUrl);
        return updated;
    }
    async remove(id, user) {
        const report = await this.getReport(id);
        this.assertCanModify(report, user);
        await this.prisma.report.delete({ where: { id } });
        await this.storage.remove(report.imageUrl);
        return { message: 'Laporan dihapus' };
    }
    async updateStatus(id, adminId, dto) {
        const report = await this.getReport(id);
        if (report.status === dto.status)
            throw new common_1.BadRequestException('Status tidak bisa sama dengan sebelumnya!');
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
    async getReport(id) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Laporan tidak ditemukan');
        return report;
    }
    assertCanModify(report, user) {
        if (user.role === client_1.Role.ADMIN)
            return;
        if (report.userId !== user.id)
            throw new common_1.ForbiddenException('Bukan laporan Anda');
        if (report.status !== client_1.ReportStatus.PENDING) {
            throw new common_1.ForbiddenException('Laporan yang sudah diproses tidak bisa diubah');
        }
    }
    buildWhere(q, userId) {
        const where = {};
        const owner = userId ?? q.userId;
        if (owner)
            where.userId = owner;
        if (q.status)
            where.status = q.status;
        if (q.category)
            where.category = q.category;
        if (q.dateFrom || q.dateTo) {
            const range = {};
            if (q.dateFrom)
                range.gte = new Date(q.dateFrom);
            if (q.dateTo)
                range.lte = new Date(q.dateTo.length === 10 ? `${q.dateTo}T23:59:59.999Z` : q.dateTo);
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map