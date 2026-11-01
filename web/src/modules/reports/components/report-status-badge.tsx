import React from 'react';
import { ReportStatus } from '../types/reports.types';

interface ReportStatusBadgeProps {
    status: ReportStatus;
    className?: string;
}

export const statusLabels: Record<ReportStatus, string> = {
    PENDING: 'Menunggu',
    IN_PROGRESS: 'Diproses',
    COMPLETED: 'Selesai',
    REJECTED: 'Ditolak',
};

export function ReportStatusBadge({ status, className = '' }: ReportStatusBadgeProps) {
    switch (status) {
        case 'PENDING':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-amber-200/90 bg-amber-50 text-amber-800 ${className}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {statusLabels.PENDING}
                </span>
            );
        case 'IN_PROGRESS':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-sky-200/90 bg-sky-50 text-sky-800 ${className}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 animate-pulse" />
                    {statusLabels.IN_PROGRESS}
                </span>
            );
        case 'COMPLETED':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-200/90 bg-emerald-50 text-emerald-800 ${className}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {statusLabels.COMPLETED}
                </span>
            );
        case 'REJECTED':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-rose-200/90 bg-rose-50 text-rose-700 ${className}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {statusLabels.REJECTED}
                </span>
            );
        default:
            return (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700 ${className}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    {status}
                </span>
            );
    }
}
