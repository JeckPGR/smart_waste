import React from 'react';
import { WasteCategory } from '../types/reports.types';

interface ReportCategoryBadgeProps {
    category?: WasteCategory | null;
    className?: string;
}

export const categoryLabels: Record<WasteCategory, string> = {
    ORGANIC: 'Organik',
    PLASTIC: 'Plastik',
    PAPER: 'Kertas',
};

export function ReportCategoryBadge({ category, className = '' }: ReportCategoryBadgeProps) {
    if (!category) {
        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-400 border border-slate-200 bg-slate-50 ${className}`}
            >
                -
            </span>
        );
    }

    const styles: Record<WasteCategory, string> = {
        ORGANIC: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-medium',
        PLASTIC: 'bg-sky-50 text-sky-800 border-sky-200/90 font-medium',
        PAPER: 'bg-amber-50 text-amber-800 border-amber-200/90 font-medium',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-sans border tracking-wide uppercase ${
                styles[category] || 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
            } ${className}`}
        >
            {categoryLabels[category]}
        </span>
    );
}
