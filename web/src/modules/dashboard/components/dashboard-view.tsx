'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowUpRight,
    Filter,
    CheckCircle2,
    ClipboardList,
    Clock,
    Plus,
    RotateCw,
    Users,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatDateTime } from '@/shared/lib/formatters';
import { useAuth } from '@/modules/auth/context/auth-context';
import { ReportCreateDialog } from '@/modules/reports/components/report-create-dialog';
import { ReportDetailDialog } from '@/modules/reports/components/report-detail-dialog';
import { ReportStatusBadge } from '@/modules/reports/components/report-status-badge';
import { ReportStatusDialog } from '@/modules/reports/components/report-status-dialog';
import { reportsService } from '@/modules/reports/services/reports.service';
import { Report } from '@/modules/reports/types/reports.types';
import { dashboardService } from '../services/dashboard.service';
import {
    DashboardStats,
    DashboardTrendItem,
    UserDashboardStats,
} from '../types/dashboard.types';
import { CategoryBreakdown } from './category-breakdown';
import { MetricCard } from './metric-card';
import { TrendChart } from './trend-chart';

export function DashboardView() {
    const { user, isAdmin } = useAuth();

    const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
    const [userStats, setUserStats] = useState<UserDashboardStats | null>(null);
    const [trend, setTrend] = useState<DashboardTrendItem[]>([]);
    const [trendDays, setTrendDays] = useState(7);
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentCategoryFilter, setRecentCategoryFilter] = useState<string>('ALL');
    const [recentStatusFilter, setRecentStatusFilter] = useState<string>('ALL');

    // Dialogs
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [statusReport, setStatusReport] = useState<Report | null>(null);

    const loadData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            if (isAdmin) {
                const [statsRes, trendRes, reportsRes] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getTrend(trendDays),
                    reportsService.list({ page: 1, limit: 30, sortBy: 'createdAt', order: 'desc' }),
                ]);
                setAdminStats(statsRes);
                setTrend(trendRes);
                setRecentReports(reportsRes.data);
            } else {
                const [userStatsRes, reportsRes] = await Promise.all([
                    dashboardService.getMyStats(),
                    reportsService.listMine({ page: 1, limit: 30, sortBy: 'createdAt', order: 'desc' }),
                ]);
                setUserStats(userStatsRes);
                setRecentReports(reportsRes.data);
            }
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, isAdmin, trendDays]);

    const handleStatusUpdated = (updated: Report) => {
        setRecentReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        if (selectedReport?.id === updated.id) setSelectedReport(updated);
        loadData(true);
    };

    const STATUS_PRIORITY: Record<string, number> = {
        PENDING: 1,      // Menunggu (Prioritas 1 / Paling atas)
        IN_PROGRESS: 2,  // Diproses (Prioritas 2)
        REJECTED: 3,     // Ditolak (Prioritas 3)
        COMPLETED: 4,    // Selesai (Prioritas 4)
    };

    const displayedRecentReports = React.useMemo(() => {
        let list = [...recentReports];

        if (recentCategoryFilter !== 'ALL') {
            list = list.filter((r) => r.category === recentCategoryFilter);
        }

        if (recentStatusFilter !== 'ALL') {
            list = list.filter((r) => r.status === recentStatusFilter);
        }

        // Urutan utama: Menunggu > Diproses > Ditolak > Selesai, lalu paling baru
        list.sort((a, b) => {
            const pA = STATUS_PRIORITY[a.status] ?? 99;
            const pB = STATUS_PRIORITY[b.status] ?? 99;
            if (pA !== pB) return pA - pB;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return list.slice(0, 5);
    }, [recentReports, recentCategoryFilter, recentStatusFilter]);

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {isAdmin
                            ? 'Ringkasan statistik penanganan dan distribusi sampah'
                            : `Selamat datang kembali, ${user?.name}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadData(true)}
                        loading={refreshing}
                    >
                        <RotateCw className="w-3.5 h-3.5" />
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Buat Laporan
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {/* Metric Cards Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="w-24 h-3.5" />
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                </div>
                                <Skeleton className="w-16 h-8" />
                                <Skeleton className="w-32 h-3" />
                            </div>
                        ))}
                    </div>

                    {/* Chart and Side Cards Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
                        <div className="lg:col-span-4">
                            <div className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-5 shadow-xs">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="space-y-1.5">
                                        <Skeleton className="w-36 h-4" />
                                        <Skeleton className="w-48 h-3" />
                                    </div>
                                    <Skeleton className="w-24 h-7 rounded-lg" />
                                </div>
                                <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2">
                                    {[35, 65, 25, 85, 45, 90, 55].map((h, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                                            <Skeleton
                                                className="w-full max-w-[28px] rounded-t-xs"
                                                style={{ height: `${h}%` }}
                                            />
                                            <Skeleton className="w-8 h-3 mt-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 space-y-5">
                            <div className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-4 shadow-xs">
                                <div className="space-y-1.5 pb-3 border-b border-slate-100">
                                    <Skeleton className="w-32 h-4" />
                                    <Skeleton className="w-44 h-3" />
                                </div>
                                <div className="space-y-3.5">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between">
                                                <Skeleton className="w-16 h-3" />
                                                <Skeleton className="w-10 h-3" />
                                            </div>
                                            <Skeleton className="w-full h-2 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* ============ METRIC CARDS ============ */}
                    {isAdmin && adminStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total Laporan"
                                value={adminStats.totalReports}
                                description="Seluruh laporan masuk di sistem"
                                icon={ClipboardList}
                            />
                            <MetricCard
                                title="Pengguna Warga"
                                value={adminStats.totalUsers}
                                description="Masyarakat terdaftar aktif"
                                icon={Users}
                            />
                            <MetricCard
                                title="Menunggu Verifikasi"
                                value={adminStats.byStatus.PENDING || 0}
                                description="Perlu ditinjau petugas"
                                icon={Clock}
                            />
                            <MetricCard
                                title="Selesai Ditangani"
                                value={adminStats.byStatus.COMPLETED || 0}
                                description={
                                    adminStats.totalReports > 0
                                        ? `${(((adminStats.byStatus.COMPLETED || 0) / adminStats.totalReports) * 100).toFixed(0)}% tingkat selesai`
                                        : '0%'
                                }
                                icon={CheckCircle2}
                            />
                        </div>
                    )}

                    {!isAdmin && userStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total Laporan Saya"
                                value={userStats.totalReports}
                                description="Laporan yang Anda ajukan"
                                icon={ClipboardList}
                            />
                            <MetricCard
                                title="Menunggu"
                                value={userStats.byStatus.PENDING || 0}
                                description="Menunggu verifikasi admin"
                                icon={Clock}
                            />
                            <MetricCard
                                title="Sedang Diproses"
                                value={userStats.byStatus.IN_PROGRESS || 0}
                                description="Petugas sedang bekerja"
                                icon={RotateCw}
                            />
                            <MetricCard
                                title="Selesai"
                                value={userStats.byStatus.COMPLETED || 0}
                                description="Laporan berhasil ditangani"
                                icon={CheckCircle2}
                            />
                        </div>
                    )}

                    {/* ============ CHARTS & RECENT SECTION ============ */}
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
                        {/* Daily Trend Overview (4 cols) */}
                        <div className="lg:col-span-4">
                            <Card
                                title="Overview Tren Laporan"
                                description="Grafik frekuensi masuknya laporan per hari"
                                action={
                                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                                        {[7, 14, 30].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setTrendDays(d)}
                                                className={`px-2 py-0.5 text-[11px] font-mono rounded-md transition-colors cursor-pointer ${
                                                    trendDays === d
                                                        ? 'bg-green-600 text-white shadow-2xs font-semibold'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                {d}H
                                            </button>
                                        ))}
                                    </div>
                                }
                            >
                                <TrendChart data={trend} />
                            </Card>
                        </div>

                        {/* Recent Reports / Category Breakdown (3 cols) */}
                        <div className="lg:col-span-3 space-y-5">
                            {isAdmin && adminStats && (
                                <Card
                                    title="Distribusi Sampah"
                                    description="Proporsi kategori sampah berdasarkan laporan"
                                >
                                    <CategoryBreakdown
                                        byCategory={adminStats.byCategory}
                                        total={adminStats.totalReports}
                                    />
                                </Card>
                            )}

                            <Card
                                title={isAdmin ? 'Laporan Terbaru' : 'Laporan Terakhir Anda'}
                                description="Urutan prioritas: Menunggu > Diproses > Ditolak > Selesai"
                                action={
                                    <Link
                                        href="/reports"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-green-700"
                                    >
                                        Semua
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                }
                            >
                                {/* Filter Bar: Kategori & Status */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-1 border-b border-slate-100">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                                        <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                                        {/* Kategori Filter */}
                                        <select
                                            value={recentCategoryFilter}
                                            onChange={(e) => setRecentCategoryFilter(e.target.value)}
                                            className="h-7 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-colors cursor-pointer"
                                            title="Filter Kategori"
                                        >
                                            <option value="ALL">Semua Kategori</option>
                                            <option value="ORGANIC">Organik</option>
                                            <option value="PLASTIC">Plastik</option>
                                            <option value="PAPER">Kertas</option>
                                        </select>

                                        {/* Status Filter */}
                                        <select
                                            value={recentStatusFilter}
                                            onChange={(e) => setRecentStatusFilter(e.target.value)}
                                            className="h-7 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-colors cursor-pointer"
                                            title="Filter Status"
                                        >
                                            <option value="ALL">Semua Status</option>
                                            <option value="PENDING">Menunggu</option>
                                            <option value="IN_PROGRESS">Diproses</option>
                                            <option value="REJECTED">Ditolak</option>
                                            <option value="COMPLETED">Selesai</option>
                                        </select>
                                    </div>

                                    {(recentCategoryFilter !== 'ALL' || recentStatusFilter !== 'ALL') && (
                                        <button
                                            onClick={() => {
                                                setRecentCategoryFilter('ALL');
                                                setRecentStatusFilter('ALL');
                                            }}
                                            className="text-[11px] text-green-700 hover:text-green-800 font-semibold cursor-pointer"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                {displayedRecentReports.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-6 text-center">
                                        Tidak ada laporan yang sesuai dengan filter.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {displayedRecentReports.map((report) => (
                                            <div
                                                key={report.id}
                                                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 px-2 -mx-2 rounded-lg transition-colors cursor-pointer"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={report.imageUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    'https://placehold.co/80x80/f1f5f9/94a3b8?text=IMG';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-900 truncate">
                                                            {report.description}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                                                            {formatDateTime(report.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {report.category && (
                                                        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-600">
                                                            {report.category === 'ORGANIC' ? 'Organik' : report.category === 'PLASTIC' ? 'Plastik' : 'Kertas'}
                                                        </span>
                                                    )}
                                                    <ReportStatusBadge status={report.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {/* Create Dialog */}
            <ReportCreateDialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreated={() => {
                    setCreateDialogOpen(false);
                    loadData(true);
                }}
            />

            {/* Detail Dialog */}
            <ReportDetailDialog
                report={selectedReport}
                isOpen={Boolean(selectedReport)}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                onClose={() => setSelectedReport(null)}
                onUpdateStatus={(rep) => {
                    setSelectedReport(null);
                    setStatusReport(rep);
                }}
            />

            {/* Status Dialog */}
            <ReportStatusDialog
                report={statusReport}
                isOpen={Boolean(statusReport)}
                onClose={() => setStatusReport(null)}
                onUpdated={handleStatusUpdated}
            />
        </div>
    );
}
