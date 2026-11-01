'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { usersService } from '../services/users.service';
import { Role, User } from '../types/users.types';

interface UserFormDialogProps {
    isOpen: boolean;
    userToEdit: User | null;
    onClose: () => void;
    onSaved: () => void;
}

export function UserFormDialog({
    isOpen,
    userToEdit,
    onClose,
    onSaved,
}: UserFormDialogProps) {
    const isEditing = Boolean(userToEdit);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<Role>('USER');
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setPassword('');
            setPhone(userToEdit.phone || '');
            setRole(userToEdit.role);
            setIsActive(userToEdit.isActive);
            setError(null);
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setRole('USER');
            setIsActive(true);
            setError(null);
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Nama wajib diisi');
            return;
        }

        if (!isEditing) {
            if (!email.trim()) {
                setError('Email wajib diisi');
                return;
            }
            if (password.length < 8) {
                setError('Password minimal 8 karakter');
                return;
            }
        }

        setLoading(true);

        try {
            if (isEditing && userToEdit) {
                await usersService.update(userToEdit.id, {
                    name: name.trim(),
                    phone: phone.trim() || undefined,
                    role,
                    isActive,
                });
            } else {
                await usersService.create({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    phone: phone.trim() || undefined,
                    role,
                });
            }
            onSaved();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'}
            maxWidth="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                    <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                        {error}
                    </div>
                )}

                <Input
                    label="Nama Lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEditing}
                    required={!isEditing}
                />

                {!isEditing && (
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                    />
                )}

                <Input
                    label="Nomor Telepon (Opsional)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-2">
                    <Select
                        label="Peran"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </Select>

                    {isEditing && (
                        <Select
                            label="Status"
                            value={isActive ? 'true' : 'false'}
                            onChange={(e) => setIsActive(e.target.value === 'true')}
                        >
                            <option value="true">Aktif</option>
                            <option value="false">Nonaktif</option>
                        </Select>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button type="submit" variant="primary" size="sm" loading={loading}>
                        Simpan
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

