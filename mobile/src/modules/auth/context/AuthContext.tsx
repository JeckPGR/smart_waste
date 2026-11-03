import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService, StoredUser } from '@/shared/services/storage.service';
import { AuthService, LoginDto, RegisterDto } from '../services/auth.service';

interface AuthContextType {
    user: StoredUser | null;
    token: string | null;
    loading: boolean;
    isFirstLaunch: boolean;
    login: (dto: LoginDto) => Promise<void>;
    register: (dto: RegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    markSplashSeen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<StoredUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState(true);

    const initAuth = async () => {
        try {
            const hasSeen = await StorageService.getHasSeenSplash();
            setIsFirstLaunch(!hasSeen);

            const savedToken = await StorageService.getToken();
            const savedUser = await StorageService.getUser();

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(savedUser);
                // Background refresh from server
                AuthService.getMe()
                    .then((fresh) => setUser(fresh))
                    .catch(() => {
                        // ignore background failure, keep cached
                    });
            }
        } catch (err) {
            console.error('Failed to init auth:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initAuth();
    }, []);

    const login = async (dto: LoginDto) => {
        const res = await AuthService.login(dto);
        setToken(res.accessToken);
        setUser(res.user);
    };

    const register = async (dto: RegisterDto) => {
        await AuthService.register(dto);
        // Sesi sengaja tidak diset agar user diarahkan login terlebih dahulu
    };

    const logout = async () => {
        await AuthService.logout();
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const fresh = await AuthService.getMe();
            setUser(fresh);
        } catch {
            // keep current
        }
    };

    const markSplashSeen = async () => {
        await StorageService.setHasSeenSplash(true);
        setIsFirstLaunch(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isFirstLaunch,
                login,
                register,
                logout,
                refreshUser,
                markSplashSeen,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

