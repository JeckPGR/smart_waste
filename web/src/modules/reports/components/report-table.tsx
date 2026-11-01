import React from 'react';
import { Eye, RotateCw, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatDateTime } from '@/shared/lib/formatters';
import { PaginationMeta, Report } from '../types/reports.types';
import { ReportCategoryBadge } from './report-category-badge';
import { ReportStatusBadge } from './report-status-badge';

interface ReportTableProps {
    reports: Report[];
    meta: PaginationMeta;
    isAdmin: boolean;
    loading?: boolean;
    currentUserId?: string;
    onViewDetail: (report: Report) => void;
    onUpdateStatus?: (report: Report) => void;
    onDelete?: (report: Report) => void;
    onPageChange: (newPage: number) => void;
}

export function ReportTable({
    reports,
    meta,
    isAdmin,
    loading = false,
    currentUserId,
    onViewDetail,
    onUpdateStatus,
    onDelete,
    onPageChange,
}: ReportTableProps) {
    if (loading) {
        return (
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4 font-medium">Foto & Deskripsi</th>
                                <th className="py-3 px-4 font-medium">Kategori</th>
                                {isAdmin && <th className="py-3 px-4 font-medium">Pelapor</th>}
                                <th className="py-3 px-4 font-medium">Status</th>
                                <th className="py-3 px-4 font-medium">Waktu</th>
                                <th className="py-3 px-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-3.5 px-4 min-w-[240px]">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
                                            <div className="space-y-1.5 flex-1">
                                                <Skeleton className="w-36 h-3.5 rounded-sm" />
                                                <Skeleton className="w-24 h-2.5 rounded-sm" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-16 h-5 rounded-md" />
                                    </td>
                                    {isAdmin && (
                                        <td className="py-3.5 px-4">
                                            <Skeleton className="w-24 h-3.5 rounded-sm" />
                                        </td>
                                    )}
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-20 h-5 rounded-full" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-28 h-3 rounded-sm" />
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Skeleton className="w-14 h-7 rounded-lg" />
                                            {isAdmin && <Skeleton className="w-14 h-7 rounded-lg" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl shadow-xs">
                <p className="text-xs text-slate-500">
                    Tidak ada laporan yang sesuai dengan filter pencarian.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="py-3 px-4 font-medium">Foto & Deskripsi</th>
                            <th className="py-3 px-4 font-medium">Kategori</th>
                            {isAdmin && <th className="py-3 px-4 font-medium">Pelapor</th>}
                            <th className="py-3 px-4 font-medium">Status</th>
                            <th className="py-3 px-4 font-medium">Waktu</th>
                            <th className="py-3 px-4 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.map((report) => {
                            const canDelete =
                                isAdmin || (report.userId === currentUserId && report.status === 'PENDING');

                            return (
                                <tr
                                    key={report.id}
                                    className="hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="py-3.5 px-4 min-w-[240px] max-w-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-2xs group relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={report.imageUrl}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://placehold.co/88x88/f1f5f9/94a3b8?text=IMG';
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">
                                                    {report.description}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                                                    {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                        <ReportCategoryBadge category={report.category} />
                                    </td>

                                    {isAdmin && (
                                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                                            <div className="truncate max-w-[140px] font-medium text-slate-800">
                                                {report.user?.name || 'Anonim'}
                                            </div>
                                        </td>
                                    )}

                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                        <ReportStatusBadge status={report.status} />
                                    </td>

                                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                        {formatDateTime(report.createdAt)}
                                    </td>

                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewDetail(report)}
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Detail
                                            </Button>
                                            {isAdmin && onUpdateStatus && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onUpdateStatus(report)}
                                                    title="Perbarui Status"
                                                >
                                                    <RotateCw className="w-3 h-3" />
                                                    Status
                                                </Button>
                                            )}
                                            {canDelete && onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(report)}
                                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    title="Hapus Laporan"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                    Total <strong className="text-slate-900">{meta.total}</strong> laporan
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.page <= 1}
                        onClick={() => onPageChange(meta.page - 1)}
                    >
                        Sebelumnya
                    </Button>
                    <span className="font-mono text-[11px]">
                        {meta.page} / {meta.totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.page >= meta.totalPages}
                        onClick={() => onPageChange(meta.page + 1)}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
