import { ApiClient } from '@/shared/services/api-client';
import { StorageService, StoredUser } from '@/shared/services/storage.service';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: StoredUser;
}

export const AuthService = {
    async login(dto: LoginDto): Promise<AuthResponse> {
        const res = await ApiClient.post<AuthResponse>('/auth/login', dto, { skipAuth: true });
        await StorageService.setToken(res.accessToken);
        await StorageService.setUser(res.user);
        return res;
    },

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const res = await ApiClient.post<AuthResponse>('/auth/register', dto, { skipAuth: true });
        await StorageService.setToken(res.accessToken);
        await StorageService.setUser(res.user);
        return res;
    },

    async getMe(): Promise<StoredUser> {
        const user = await ApiClient.get<StoredUser>('/auth/me');
        await StorageService.setUser(user);
        return user;
    },

    async logout(): Promise<void> {
        await StorageService.clearAuth();
    },
};

