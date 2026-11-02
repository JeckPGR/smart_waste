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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (d) => new Date(d.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async stats() {
        const [total, byStatus, byCategory, totalUsers] = await Promise.all([
            this.prisma.report.count(),
            this.prisma.report.groupBy({ by: ['status'], _count: { _all: true } }),
            this.prisma.report.groupBy({ by: ['category'], _count: { _all: true } }),
            this.prisma.user.count({ where: { role: client_1.Role.USER } }),
        ]);
        const status = Object.fromEntries(Object.values(client_1.ReportStatus).map((s) => [s, 0]));
        byStatus.forEach((r) => (status[r.status] = r._count._all));
        const category = { ORGANIC: 0, PLASTIC: 0, PAPER: 0, UNCATEGORIZED: 0 };
        byCategory.forEach((r) => (category[r.category ?? 'UNCATEGORIZED'] = r._count._all));
        return { totalReports: total, totalUsers, byStatus: status, byCategory: category };
    }
    async trend(days) {
        const now = new Date();
        const start = new Date(`${dayKey(new Date(now.getTime() - (days - 1) * DAY_MS))}T00:00:00+07:00`);
        const rows = await this.prisma.report.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } });
        const counts = new Map();
        for (let i = days - 1; i >= 0; i--)
            counts.set(dayKey(new Date(now.getTime() - i * DAY_MS)), 0);
        rows.forEach((r) => {
            const k = dayKey(r.createdAt);
            counts.set(k, (counts.get(k) ?? 0) + 1);
        });
        return Array.from(counts, ([date, count]) => ({ date, count }));
    }
    async me(userId) {
        const grouped = await this.prisma.report.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } });
        const byStatus = Object.fromEntries(Object.values(client_1.ReportStatus).map((s) => [s, 0]));
        grouped.forEach((r) => (byStatus[r.status] = r._count._all));
        const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
        return { totalReports: total, byStatus };
    }
    async leaderboard() {
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                role: true,
                reports: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });
        const demoParticipants = [
            { name: 'Siti Rahma', reports: 14, completed: 13 },
            { name: 'Budi Santoso', reports: 11, completed: 10 },
            { name: 'Rian Pratama', reports: 8, completed: 7 },
            { name: 'Dewi Lestari', reports: 6, completed: 5 },
            { name: 'Bayu Wicaksono', reports: 5, completed: 4 },
            { name: 'Anisa Putri', reports: 4, completed: 4 },
            { name: 'Dimas Anggara', reports: 3, completed: 3 },
            { name: 'Fitri Handayani', reports: 3, completed: 2 },
            { name: 'Agus Setiawan', reports: 2, completed: 2 },
            { name: 'Nurul Hidayah', reports: 2, completed: 1 },
        ];
        const realList = users.map((u) => {
            const totalReports = u.reports.length;
            const completedReports = u.reports.filter((r) => r.status === client_1.ReportStatus.COMPLETED).length;
            const xp = (totalReports * 50) + (completedReports * 50);
            const level = Math.max(1, Math.floor(xp / 150) + 1);
            return {
                id: u.id,
                name: u.name,
                role: u.role,
                totalReports,
                completedReports,
                xp,
                level,
            };
        });
        const combined = [...realList];
        const existingNames = new Set(realList.map((u) => u.name.toLowerCase()));
        for (const demo of demoParticipants) {
            if (combined.length >= 10)
                break;
            if (existingNames.has(demo.name.toLowerCase()))
                continue;
            const xp = (demo.reports * 50) + (demo.completed * 50);
            const level = Math.max(1, Math.floor(xp / 150) + 1);
            combined.push({
                id: `demo-${demo.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: demo.name,
                role: client_1.Role.USER,
                totalReports: demo.reports,
                completedReports: demo.completed,
                xp,
                level,
            });
        }
        combined.sort((a, b) => {
            if (b.xp !== a.xp)
                return b.xp - a.xp;
            if (b.completedReports !== a.completedReports)
                return b.completedReports - a.completedReports;
            return b.totalReports - a.totalReports;
        });
        return combined.slice(0, 10).map((u, idx) => ({
            ...u,
            rank: idx + 1,
            rankBadge: idx === 0 ? 'GOLD' : idx === 1 ? 'SILVER' : idx === 2 ? 'BRONZE' : 'STANDARD',
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map