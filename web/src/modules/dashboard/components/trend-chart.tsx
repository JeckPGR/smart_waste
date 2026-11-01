'use client';

import React from 'react';
import { DashboardTrendItem } from '../types/dashboard.types';

interface TrendChartProps {
    data: DashboardTrendItem[];
}

export function TrendChart({ data }: TrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400">
                Tidak ada data tren laporan
            </div>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 4);
    const count = data.length;

    // Formatting date label based on how many days are displayed
    const shouldShowLabel = (idx: number) => {
        if (count <= 7) return true;
        if (count <= 14) return idx % 2 === 0;
        return idx % 5 === 0 || idx === count - 1;
    };

    const formatDateLabel = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (count > 14) {
                return `${d.getDate()}/${d.getMonth() + 1}`;
            }
            return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        } catch {
            return dateStr.slice(5);
        }
    };

    const barMaxWidth = count > 14 ? 'max-w-[8px]' : count > 7 ? 'max-w-[16px]' : 'max-w-[28px]';
    const gapClass = count > 14 ? 'gap-0.5 sm:gap-1' : count > 7 ? 'gap-1 sm:gap-1.5' : 'gap-2 sm:gap-3';

    return (
        <div className="w-full overflow-hidden">
            <div className={`flex items-end justify-between ${gapClass} h-48 pt-6 pb-2 w-full overflow-hidden`}>
                {data.map((item, idx) => {
                    const heightPercent = (item.count / maxCount) * 100;
                    const isZero = item.count === 0;
                    const showLabel = shouldShowLabel(idx);

                    return (
                        <div
                            key={item.date}
                            className="flex-1 flex flex-col items-center h-full min-w-0 group relative select-none"
                            title={`${item.date}: ${item.count} laporan`}
                        >
                            {/* Hover tooltip */}
                            <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm whitespace-nowrap z-20 shadow-xs">
                                {item.count} lap
                            </div>

                            {/* Bar container occupying flexible space */}
                            <div className="w-full flex-1 flex items-end justify-center min-h-0">
                                <div className={`w-full ${barMaxWidth} bg-slate-100 rounded-t-xs h-full flex items-end overflow-hidden`}>
                                    <div
                                        style={{ height: `${Math.max(heightPercent, isZero ? 2 : 6)}%` }}
                                        className={`w-full rounded-t-xs transition-all duration-300 ${
                                            isZero
                                                ? 'bg-slate-200'
                                                : 'bg-slate-900 group-hover:bg-slate-700'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Fixed-height date label container so all bars have identical baseline */}
                            <div className="h-5 flex items-center justify-center w-full mt-1.5 overflow-hidden">
                                {showLabel && (
                                    <span className="text-[10px] text-slate-400 font-mono truncate text-center leading-none">
                                        {formatDateLabel(item.date)}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
