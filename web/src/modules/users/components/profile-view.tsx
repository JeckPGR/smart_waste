'use client';

import React, { useState } from 'react';
import { KeyRound, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { useAuth } from '@/modules/auth/context/auth-context';
import { usersService } from '../services/users.service';

export function ProfileView() {
    const { user, refreshUser } = useAuth();

    // Profile form
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ text: string; isError?: boolean } | null>(null);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError?: boolean } | null>(null);

    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        setProfileLoading(true);

        try {
            await usersService.updateMe({
                name: name.trim(),
                phone: phone.trim() || undefined,
            });
            await refreshUser();
            setProfileMessage({ text: 'Profil berhasil diperbarui' });
        } catch (err: unknown) {
            setProfileMessage({ text: err instanceof Error ? err.message : 'Gagal memperbarui profil', isError: true });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 8) {
            setPasswordMessage({ text: 'Password baru minimal 8 karakter', isError: true });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'Konfirmasi password baru tidak cocok', isError: true });
            return;
        }

        setPasswordLoading(true);

        try {
            await usersService.changePassword({
                currentPassword,
                newPassword,
            });
            setPasswordMessage({ text: 'Password berhasil diubah' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            setPasswordMessage({ text: err instanceof Error ? err.message : 'Gagal mengubah password', isError: true });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Pengaturan Akun
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Kelola informasi profil pribadi dan keamanan akun Anda
                </p>
            </div>

            <div className="space-y-6 w-full">
                {/* Profile Info - Full Width */}
                <Card
                    title="Informasi Profil"
                    description="Perbarui nama dan nomor kontak Anda"
                    action={<User className="w-4 h-4 text-slate-400" />}
                    className="w-full"
                >
                    {profileMessage && (
                        <div
                            className={`p-3 mb-4 text-xs rounded-lg border ${
                                profileMessage.isError
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-50 text-slate-900 border-slate-200'
                            }`}
                        >
                            {profileMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                value={user?.email || ''}
                                disabled
                                hint="Email tidak dapat diubah"
                            />

                            <Input
                                label="Peran Akun"
                                value={user?.role || ''}
                                disabled
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Nama Lengkap"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <Input
                                label="Nomor Telepon"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="08123456789"
                            />
                        </div>

                        <div>
                            <Button type="submit" size="sm" loading={profileLoading}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Change Password - Full Width */}
                <Card
                    title="Ubah Password"
                    description="Pastikan kata sandi Anda aman dan kuat"
                    action={<KeyRound className="w-4 h-4 text-slate-400" />}
                    className="w-full"
                >
                    {passwordMessage && (
                        <div
                            className={`p-3 mb-4 text-xs rounded-lg border ${
                                passwordMessage.isError
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-50 text-slate-900 border-slate-200'
                            }`}
                        >
                            {passwordMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-2xl">
                        <Input
                            label="Password Saat Ini"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Password Baru"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 karakter"
                                required
                            />

                            <Input
                                label="Konfirmasi Password Baru"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <Button type="submit" size="sm" loading={passwordLoading}>
                                Ubah Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
