'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Recycle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useAuth } from '../context/auth-context';

export function RegisterForm() {
    const { register } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Nama lengkap wajib diisi');
            return;
        }
        if (password.length < 8) {
            setError('Password minimal 8 karakter');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || undefined,
            });
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Pendaftaran akun gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/smart-waste-mascot.png"
                    alt="Smart Waste Mascot"
                    className="w-14 h-14 object-contain mx-auto mb-1"
                />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Daftar Akun Baru
                </h1>
                <p className="text-xs text-slate-500">
                    Mulai laporkan tumpukan sampah di lingkungan Anda
                </p>
            </div>

            <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
                {error && (
                    <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <Input
                        label="Nama Lengkap"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Lengkap"
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                    />

                    <Input
                        label="Nomor Telepon (Opsional)"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08123456789"
                    />

                    <Button type="submit" loading={loading} className="w-full mt-2" size="md">
                        Daftar Akun
                    </Button>
                </form>

                <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                    Sudah memiliki akun?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-green-600 hover:text-green-700 underline underline-offset-4"
                    >
                        Masuk di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
