import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon?: LucideIcon;
    badge?: string;
}

export function MetricCard({ title, value, description, icon: Icon, badge }: MetricCardProps) {
    return (
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium text-slate-600">{title}</span>
                {Icon ? (
                    <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-100/80 flex items-center justify-center text-green-600">
                        <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                ) : badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono border border-slate-200 rounded-xs">
                        {badge}
                    </span>
                ) : null}
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                {value}
            </div>
            {description && (
                <p className="mt-1 text-[11px] text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}
