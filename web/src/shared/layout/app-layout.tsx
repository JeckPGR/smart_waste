'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/auth-context';
import { ReportCreateDialog } from '@/modules/reports/components/report-create-dialog';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleToggleSidebar = () => {
        if (window.innerWidth >= 1024) {
            setDesktopCollapsed((prev) => !prev);
        } else {
            setMobileOpen((prev) => !prev);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar skeleton */}
                <div className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col p-4 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
                        <div className="w-24 h-4 rounded-sm bg-slate-200 animate-pulse" />
                    </div>
                    <div className="w-full h-8 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="space-y-2 flex-1 pt-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full h-8 rounded-lg bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                    <div className="w-full h-14 rounded-lg bg-slate-100 animate-pulse" />
                </div>

                {/* Main area skeleton */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
                        <div className="w-32 h-4 rounded-sm bg-slate-200 animate-pulse" />
                        <div className="w-28 h-7 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="w-40 h-6 rounded-md bg-slate-200 animate-pulse" />
                                <div className="w-64 h-3 rounded-sm bg-slate-200 animate-pulse" />
                            </div>
                            <div className="w-28 h-8 rounded-lg bg-slate-200 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-28 rounded-xl bg-white border border-slate-200/80 p-4 space-y-3 shadow-xs">
                                    <div className="w-20 h-3 rounded-sm bg-slate-100 animate-pulse" />
                                    <div className="w-16 h-7 rounded-md bg-slate-200 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
            <AppSidebar
                isOpen={mobileOpen}
                isCollapsed={desktopCollapsed}
                onClose={() => setMobileOpen(false)}
                onOpenCreateReport={() => setCreateDialogOpen(true)}
            />

            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
                    desktopCollapsed ? 'lg:pl-16' : 'lg:pl-60'
                }`}
            >
                <AppHeader onToggleSidebar={handleToggleSidebar} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>

            {/* Global Create Dialog */}
            <ReportCreateDialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreated={() => {
                    setCreateDialogOpen(false);
                    // trigger page reload or dispatch event if needed
                    window.location.reload();
                }}
            />
        </div>
    );
}
