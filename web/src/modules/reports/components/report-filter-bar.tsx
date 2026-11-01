import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';

interface ReportFilterBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    categoryFilter: string;
    onCategoryChange: (val: string) => void;
    sortBy: string;
    onSortChange: (val: 'createdAt' | 'updatedAt' | 'status') => void;
    order: string;
    onOrderChange: (val: 'desc' | 'asc') => void;
    onReset: () => void;
}

export function ReportFilterBar({
    search,
    onSearchChange,
    onSearchSubmit,
    statusFilter,
    onStatusChange,
    categoryFilter,
    onCategoryChange,
    sortBy,
    onSortChange,
    order,
    onOrderChange,
    onReset,
}: ReportFilterBarProps) {
    const hasActiveFilters = Boolean(
        search || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || sortBy !== 'createdAt' || order !== 'desc',
    );

    return (
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs space-y-3">
            {/* Search row */}
            <form onSubmit={onSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari deskripsi, lokasi alamat, atau nama pelapor..."
                        className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
                    />
                </div>
                <Button type="submit" variant="primary" size="md">
                    Cari
                </Button>
                {hasActiveFilters && (
                    <Button type="button" variant="outline" size="md" onClick={onReset} title="Reset Filter">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                    </Button>
                )}
            </form>

            {/* Filter controls row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 border-t border-slate-100 items-center">
                <Select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    aria-label="Filter Status"
                >
                    <option value="ALL">Semua Status</option>
                    <option value="PENDING">Menunggu (Pending)</option>
                    <option value="IN_PROGRESS">Diproses (In Progress)</option>
                    <option value="COMPLETED">Selesai (Completed)</option>
                    <option value="REJECTED">Ditolak (Rejected)</option>
                </Select>

                <Select
                    value={categoryFilter}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    aria-label="Filter Kategori"
                >
                    <option value="ALL">Semua Kategori</option>
                    <option value="ORGANIC">Kategori: Organik</option>
                    <option value="PLASTIC">Kategori: Plastik</option>
                    <option value="PAPER">Kategori: Kertas</option>
                </Select>

                <Select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as 'createdAt' | 'updatedAt' | 'status')}
                    aria-label="Urutkan Berdasarkan"
                >
                    <option value="createdAt">Urut: Waktu Dibuat</option>
                    <option value="updatedAt">Urut: Waktu Update</option>
                    <option value="status">Urut: Status</option>
                </Select>

                <Select
                    value={order}
                    onChange={(e) => onOrderChange(e.target.value as 'desc' | 'asc')}
                    aria-label="Urutan Arah"
                >
                    <option value="desc">Arah: Terbaru ke Terlama</option>
                    <option value="asc">Arah: Terlama ke Terbaru</option>
                </Select>
            </div>
        </div>
    );
}
