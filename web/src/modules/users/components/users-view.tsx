'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Select } from '@/shared/components/ui/select';
import { useAuth } from '@/modules/auth/context/auth-context';
import { usersService } from '../services/users.service';
import { PaginationMeta, Role, User } from '../types/users.types';
import { UserFormDialog } from './user-form-dialog';
import { UserTable } from './user-table';

export function UsersView() {
    const { user, isAdmin } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Dialogs
    const [formOpen, setFormOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await usersService.list({
                page,
                limit: 10,
                search: search.trim() || undefined,
                role: roleFilter !== 'ALL' ? (roleFilter as Role) : undefined,
            });
            setUsers(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, page, roleFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        setIsDeleting(true);
        try {
            await usersService.delete(deleteUser.id);
            setDeleteUser(null);
            fetchUsers();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Gagal menghapus pengguna');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl shadow-xs">
                <h2 className="text-sm font-semibold text-slate-900">Akses Terbatas</h2>
                <p className="text-xs text-slate-500 mt-1">
                    Hanya Administrator yang memiliki akses ke halaman manajemen pengguna.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Manajemen Pengguna
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola data akun pengguna, staf administrator, dan status keaktifan
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => {
                        setEditUser(null);
                        setFormOpen(true);
                    }}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Pengguna
                </Button>
            </div>

            {/* Filter */}
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs flex flex-col sm:flex-row gap-2.5">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email pengguna..."
                            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                        />
                    </div>
                    <Button type="submit" variant="primary" size="md">
                        Cari
                    </Button>
                </form>

                <div className="w-full sm:w-44">
                    <Select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                        aria-label="Filter Peran"
                    >
                        <option value="ALL">Semua Peran</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <UserTable
                users={users}
                meta={meta}
                loading={loading}
                currentUserId={user?.id}
                onEdit={(item) => {
                    setEditUser(item);
                    setFormOpen(true);
                }}
                onDelete={setDeleteUser}
                onPageChange={setPage}
            />

            {/* Form Dialog */}
            <UserFormDialog
                isOpen={formOpen}
                userToEdit={editUser}
                onClose={() => {
                    setFormOpen(false);
                    setEditUser(null);
                }}
                onSaved={fetchUsers}
            />

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={Boolean(deleteUser)}
                onClose={() => setDeleteUser(null)}
                onConfirm={handleDelete}
                title="Hapus Pengguna"
                description={`Apakah Anda yakin ingin menghapus akun "${deleteUser?.name}" (${deleteUser?.email})?`}
                confirmText="Hapus Pengguna"
                isDestructive
                loading={isDeleting}
            />
        </div>
    );
}
