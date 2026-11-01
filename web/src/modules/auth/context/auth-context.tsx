'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/shared/lib/token-storage';
import { authService } from '../services/auth.service';
import { LoginDto, RegisterDto, User } from '../types/auth.types';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAdmin: boolean;
    login: (dto: LoginDto) => Promise<User>;
    register: (dto: RegisterDto) => Promise<User>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchSession = async (savedToken: string) => {
        try {
            const me = await authService.me(savedToken);
            setUser(me);
            setToken(savedToken);
        } catch {
            tokenStorage.clear();
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedToken = tokenStorage.get();
        if (savedToken) {
            fetchSession(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (dto: LoginDto): Promise<User> => {
        const res = await authService.login(dto);
        tokenStorage.set(res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
        return res.user;
    };

    const register = async (dto: RegisterDto): Promise<User> => {
        const res = await authService.register(dto);
        tokenStorage.set(res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
        return res.user;
    };

    const logout = () => {
        tokenStorage.clear();
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        const currentToken = tokenStorage.get();
        if (currentToken) {
            try {
                const me = await authService.me(currentToken);
                setUser(me);
            } catch {
                logout();
            }
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAdmin,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

