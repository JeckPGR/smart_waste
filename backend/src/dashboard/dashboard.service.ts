import { Injectable } from '@nestjs/common';
import { ReportStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (d: Date) => new Date(d.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);

export interface LeaderboardUser {
    id: string;
    name: string;
    role: Role;
    totalReports: number;
    completedReports: number;
    xp: number;
    level: number;
    rank: number;
    rankBadge: 'GOLD' | 'SILVER' | 'BRONZE' | 'STANDARD';
}

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async stats() {
        const [total, byStatus, byCategory, totalUsers] = await Promise.all([
            this.prisma.report.count(),
            this.prisma.report.groupBy({ by: ['status'], _count: { _all: true } }),
            this.prisma.report.groupBy({ by: ['category'], _count: { _all: true } }),
            this.prisma.user.count({ where: { role: Role.USER } }),
        ]);

        const status: Record<string, number> = Object.fromEntries(Object.values(ReportStatus).map((s) => [s, 0]));
        byStatus.forEach((r) => (status[r.status] = r._count._all));

        const category: Record<string, number> = { ORGANIC: 0, PLASTIC: 0, PAPER: 0, UNCATEGORIZED: 0 };
        byCategory.forEach((r) => (category[r.category ?? 'UNCATEGORIZED'] = r._count._all));

        return { totalReports: total, totalUsers, byStatus: status, byCategory: category };
    }

    /** Jumlah laporan per hari (zona WIB), hari tanpa laporan tetap muncul dengan nilai 0. */
    async trend(days: number) {
        const now = new Date();
        const start = new Date(`${dayKey(new Date(now.getTime() - (days - 1) * DAY_MS))}T00:00:00+07:00`);
        const rows = await this.prisma.report.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } });

        const counts = new Map<string, number>();
        for (let i = days - 1; i >= 0; i--) counts.set(dayKey(new Date(now.getTime() - i * DAY_MS)), 0);
        rows.forEach((r) => {
            const k = dayKey(r.createdAt);
            counts.set(k, (counts.get(k) ?? 0) + 1);
        });
        return Array.from(counts, ([date, count]) => ({ date, count }));
    }

    async me(userId: string) {
        const grouped = await this.prisma.report.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } });
        const byStatus: Record<string, number> = Object.fromEntries(Object.values(ReportStatus).map((s) => [s, 0]));
        grouped.forEach((r) => (byStatus[r.status] = r._count._all));
        const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
        return { totalReports: total, byStatus };
    }

    /** Top 10 Leaderboard: Peringkat warga berdasarkan XP (sampah ditemukan & terverifikasi selesai) - 100% Real Data */
    async leaderboard(): Promise<LeaderboardUser[]> {
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

        const list = users.map((u) => {
            const totalReports = u.reports.length;
            const completedReports = u.reports.filter((r) => r.status === ReportStatus.COMPLETED).length;
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

        // Urutkan murni berdasarkan XP desc, completedReports desc, totalReports desc
        list.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp;
            if (b.completedReports !== a.completedReports) return b.completedReports - a.completedReports;
            return b.totalReports - a.totalReports;
        });

        return list.slice(0, 10).map((u, idx) => ({
            ...u,
            rank: idx + 1,
            rankBadge: idx === 0 ? 'GOLD' : idx === 1 ? 'SILVER' : idx === 2 ? 'BRONZE' : 'STANDARD',
        }));
    }
}
