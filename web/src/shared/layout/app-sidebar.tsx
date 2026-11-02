'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Plus,
    Recycle,
    Settings,
    Users,
    X,
} from 'lucide-react';
import { useAuth } from '@/modules/auth/context/auth-context';

interface AppSidebarProps {
    isOpen: boolean; // For mobile
    isCollapsed: boolean; // For desktop collapsed state
    onClose: () => void;
    onOpenCreateReport?: () => void;
}

export function AppSidebar({
    isOpen,
    isCollapsed,
    onClose,
    onOpenCreateReport,
}: AppSidebarProps) {
    const pathname = usePathname();
    const { user, isAdmin, logout } = useAuth();

    const navItems = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            show: true,
        },
        {
            label: isAdmin ? 'Semua Laporan' : 'Laporan Saya',
            href: '/reports',
            icon: ClipboardList,
            show: true,
        },
        {
            label: 'Manajemen Pengguna',
            href: '/users',
            icon: Users,
            show: isAdmin,
        },
        {
            label: 'Pengaturan Akun',
            href: '/profile',
            icon: Settings,
            show: true,
        },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'} w-64`}
            >
                {/* Brand Header */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 font-semibold text-xs tracking-tight text-slate-900 overflow-hidden"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/smart-waste-mascot.png"
                            alt="Smart Waste Mascot"
                            className="w-7 h-7 object-contain shrink-0"
                        />
                        {!isCollapsed && (
                            <div className="truncate font-mono">
                                <span>SMART</span>WASTE
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
                        aria-label="Tutup Menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Quick Action Button */}
                {onOpenCreateReport && (
                    <div className="p-3">
                        <button
                            onClick={() => {
                                onOpenCreateReport();
                                onClose();
                            }}
                            className={`flex items-center justify-center gap-2 w-full h-8 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer ${
                                isCollapsed ? 'px-0' : 'px-3'
                            }`}
                            title="Buat Laporan Baru"
                        >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            {!isCollapsed && <span>Laporan Baru</span>}
                        </button>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
                    {navItems
                        .filter((item) => item.show)
                        .map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-slate-100 text-slate-900 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                >
                                    <Icon
                                        className={`w-4 h-4 shrink-0 ${
                                            isActive ? 'text-slate-900' : 'text-slate-500'
                                        }`}
                                    />
                                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                </nav>

                {/* User footer */}
                <div className="p-3 pb-5 border-t border-slate-100 space-y-2">
                    <div
                        className={`rounded-lg bg-slate-50 border border-slate-100 p-2 ${
                            isCollapsed ? 'text-center' : ''
                        }`}
                    >
                        <div className="text-xs font-medium text-slate-900 truncate">
                            {isCollapsed ? user?.name?.slice(0, 2).toUpperCase() : user?.name}
                        </div>
                        {!isCollapsed && (
                            <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400">
                                <span className="truncate max-w-[110px]">{user?.email}</span>
                                <span className="px-1 py-0.2 border border-slate-200 rounded-xs uppercase text-slate-600">
                                    {user?.role}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Logout Button in Red (desktop & mobile) */}
                    <button
                        onClick={logout}
                        title={isCollapsed ? 'Keluar' : undefined}
                        className={`flex items-center gap-2 w-full px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ${
                            isCollapsed ? 'justify-center px-0' : ''
                        }`}
                    >
                        <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        {!isCollapsed && <span className="text-rose-600 font-semibold">Keluar (Logout)</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
