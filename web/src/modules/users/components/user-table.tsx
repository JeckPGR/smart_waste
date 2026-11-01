import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatDate } from '@/shared/lib/formatters';
import { PaginationMeta, User } from '../types/users.types';

interface UserTableProps {
    users: User[];
    meta: PaginationMeta;
    loading?: boolean;
    currentUserId?: string;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onPageChange: (newPage: number) => void;
}

export function UserTable({
    users,
    meta,
    loading = false,
    currentUserId,
    onEdit,
    onDelete,
    onPageChange,
}: UserTableProps) {
    if (loading) {
        return (
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4 font-medium">Nama & Email</th>
                                <th className="py-3 px-4 font-medium">No. Telepon</th>
                                <th className="py-3 px-4 font-medium">Peran</th>
                                <th className="py-3 px-4 font-medium">Status</th>
                                <th className="py-3 px-4 font-medium">Terdaftar</th>
                                <th className="py-3 px-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-28 h-3.5 rounded-sm mb-1.5" />
                                        <Skeleton className="w-40 h-2.5 rounded-sm" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-24 h-3 rounded-sm" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-14 h-5 rounded-md" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-16 h-4 rounded-full" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Skeleton className="w-20 h-3 rounded-sm" />
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Skeleton className="w-14 h-7 rounded-lg" />
                                            <Skeleton className="w-14 h-7 rounded-lg" />
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

    if (users.length === 0) {
        return (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl shadow-xs">
                <p className="text-xs text-slate-500">Tidak ada pengguna ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="py-3 px-4 font-medium">Nama & Email</th>
                            <th className="py-3 px-4 font-medium">No. Telepon</th>
                            <th className="py-3 px-4 font-medium">Peran</th>
                            <th className="py-3 px-4 font-medium">Status</th>
                            <th className="py-3 px-4 font-medium">Terdaftar</th>
                            <th className="py-3 px-4 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((item) => {
                            const isCurrent = item.id === currentUserId;

                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900 flex items-center gap-2">
                                            <span>{item.name}</span>
                                            {isCurrent && (
                                                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded-xs text-slate-600">
                                                    Anda
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                            {item.email}
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                                        {item.phone || '-'}
                                    </td>

                                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                                        <span
                                            className={`px-2 py-0.5 rounded-md border text-[11px] font-sans uppercase font-medium ${
                                                item.role === 'ADMIN'
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'border-slate-200 bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            {item.role}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    item.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                                }`}
                                            />
                                            {item.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                        {formatDate(item.createdAt)}
                                    </td>

                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEdit(item)}
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Edit
                                            </Button>
                                            {!isCurrent && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(item)}
                                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Hapus
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
                    Total <strong className="text-slate-900">{meta.total}</strong> pengguna
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
