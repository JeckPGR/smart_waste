'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { useAuth } from '@/modules/auth/context/auth-context';
import { reportsService } from '../services/reports.service';
import { PaginationMeta, Report, ReportStatus, WasteCategory } from '../types/reports.types';
import { ReportCreateDialog } from './report-create-dialog';
import { ReportDetailDialog } from './report-detail-dialog';
import { ReportFilterBar } from './report-filter-bar';
import { ReportStatusDialog } from './report-status-dialog';
import { ReportTable } from './report-table';

export function ReportsView() {
    const { user, isAdmin } = useAuth();

    const [reports, setReports] = useState<Report[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'status'>('createdAt');
    const [order, setOrder] = useState<'desc' | 'asc'>('desc');

    // Dialogs
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [statusReport, setStatusReport] = useState<Report | null>(null);
    const [deleteReport, setDeleteReport] = useState<Report | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search: search.trim() || undefined,
                status: statusFilter !== 'ALL' ? (statusFilter as ReportStatus) : undefined,
                category: categoryFilter !== 'ALL' ? (categoryFilter as WasteCategory) : undefined,
                sortBy,
                order,
            };

            const res = isAdmin
                ? await reportsService.list(params)
                : await reportsService.listMine(params);

            setReports(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user, isAdmin, page, statusFilter, categoryFilter, sortBy, order]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchReports();
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('ALL');
        setCategoryFilter('ALL');
        setSortBy('createdAt');
        setOrder('desc');
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteReport) return;
        setIsDeleting(true);
        try {
            await reportsService.delete(deleteReport.id);
            setDeleteReport(null);
            if (selectedReport?.id === deleteReport.id) setSelectedReport(null);
            fetchReports();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Gagal menghapus laporan');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusUpdated = (updated: Report) => {
        setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        if (selectedReport?.id === updated.id) setSelectedReport(updated);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        {isAdmin ? 'Semua Laporan Sampah' : 'Laporan Saya'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {isAdmin
                            ? 'Daftar dan verifikasi laporan sampah dari masyarakat'
                            : 'Kelola dan pantau status laporan sampah Anda'}
                    </p>
                </div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    Buat Laporan
                </Button>
            </div>

            {/* Filter Bar */}
            <ReportFilterBar
                search={search}
                onSearchChange={setSearch}
                onSearchSubmit={handleSearchSubmit}
                statusFilter={statusFilter}
                onStatusChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                }}
                categoryFilter={categoryFilter}
                onCategoryChange={(val) => {
                    setCategoryFilter(val);
                    setPage(1);
                }}
                sortBy={sortBy}
                onSortChange={(val) => {
                    setSortBy(val);
                    setPage(1);
                }}
                order={order}
                onOrderChange={(val) => {
                    setOrder(val);
                    setPage(1);
                }}
                onReset={handleResetFilters}
            />

            {/* Table */}
            <ReportTable
                reports={reports}
                meta={meta}
                isAdmin={isAdmin}
                loading={loading}
                currentUserId={user?.id}
                onViewDetail={setSelectedReport}
                onUpdateStatus={setStatusReport}
                onDelete={setDeleteReport}
                onPageChange={setPage}
            />

            {/* Create Dialog */}
            <ReportCreateDialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => {
                    setCreateOpen(false);
                    setPage(1);
                    fetchReports();
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
                onDelete={(rep) => {
                    setSelectedReport(null);
                    setDeleteReport(rep);
                }}
            />

            {/* Status Dialog */}
            <ReportStatusDialog
                report={statusReport}
                isOpen={Boolean(statusReport)}
                onClose={() => setStatusReport(null)}
                onUpdated={handleStatusUpdated}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deleteReport)}
                onClose={() => setDeleteReport(null)}
                onConfirm={handleDelete}
                title="Hapus Laporan"
                description={`Apakah Anda yakin ingin menghapus laporan "${deleteReport?.description.slice(0, 30)}..."? Tindakan ini permanen.`}
                confirmText="Hapus"
                isDestructive
                loading={isDeleting}
            />
        </div>
    );
}
