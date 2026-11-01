'use client';

import React from 'react';
import { PanelLeft, Shield, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/auth-context';

interface AppHeaderProps {
    onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
    const { user, isAdmin } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white/95 backdrop-blur-xs border-b border-slate-200/80">
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle Button for both desktop and mobile */}
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Toggle Sidebar"
                    aria-label="Toggle Sidebar"
                >
                    <PanelLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">Smart Waste</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 font-medium">
                        {isAdmin ? 'Admin Console' : 'Portal Warga'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
                    {isAdmin ? (
                        <Shield className="w-3.5 h-3.5 text-slate-700" />
                    ) : (
                        <User className="w-3.5 h-3.5 text-slate-700" />
                    )}
                    <span className="font-medium text-slate-800 max-w-[120px] sm:max-w-none truncate">
                        {user?.name}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono bg-white border border-slate-200 rounded-xs text-slate-600 uppercase">
                        {user?.role}
                    </span>
                </div>
            </div>
        </header>
    );
}
