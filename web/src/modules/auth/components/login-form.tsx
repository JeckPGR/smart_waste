'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Recycle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useAuth } from '../context/auth-context';

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({ email: email.trim(), password });
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    const handleFillAdmin = () => {
        setEmail('admin@smartwaste.id');
        setPassword('Admin123!');
        setError(null);
    };

    const handleFillUser = () => {
        setEmail('warga@smartwaste.id');
        setPassword('Warga123!');
        setError(null);
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
                    Smart Waste System
                </h1>
                <p className="text-xs text-slate-500">
                    Masuk ke portal pengelolaan dan pelaporan sampah
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
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@smartwaste.id"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" loading={loading} className="w-full mt-2" size="md">
                        Masuk
                    </Button>
                </form>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-medium text-slate-400 text-center uppercase tracking-wider">
                        Akun Demo Instan
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleFillAdmin}
                        >
                            Admin
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleFillUser}
                        >
                            Warga (User)
                        </Button>
                    </div>
                </div>

                <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-50">
                    Belum punya akun?{' '}
                    <Link
                        href="/register"
                        className="font-medium text-green-600 hover:text-green-700 underline underline-offset-4"
                    >
                        Daftar di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
