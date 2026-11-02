import React from 'react';
import { FileText, Leaf, Recycle } from 'lucide-react';

interface CategoryBreakdownProps {
    byCategory: {
        ORGANIC: number;
        PLASTIC: number;
        PAPER: number;
        UNCATEGORIZED?: number;
    };
    total: number;
}

export function CategoryBreakdown({ byCategory, total }: CategoryBreakdownProps) {
    const categories = [
        { key: 'ORGANIC', label: 'Organik', icon: Leaf, count: byCategory.ORGANIC || 0, barColor: 'bg-green-600', iconColor: 'text-green-600' },
        { key: 'PLASTIC', label: 'Plastik', icon: Recycle, count: byCategory.PLASTIC || 0, barColor: 'bg-sky-500', iconColor: 'text-sky-500' },
        { key: 'PAPER', label: 'Kertas', icon: FileText, count: byCategory.PAPER || 0, barColor: 'bg-amber-500', iconColor: 'text-amber-500' },
    ];

    return (
        <div className="space-y-4">
            {categories.map((cat) => {
                const Icon = cat.icon;
                const pct = total > 0 ? ((cat.count / total) * 100).toFixed(0) : '0';

                return (
                    <div key={cat.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                <Icon className={`w-3.5 h-3.5 ${cat.iconColor}`} />
                                {cat.label}
                            </span>
                            <span className="font-mono text-slate-500">
                                {cat.count} ({pct}%)
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${cat.barColor} rounded-full transition-all`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
