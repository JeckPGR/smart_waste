import { httpClient } from '@/shared/lib/http-client';
import { AuthResponse, LoginDto, RegisterDto, User } from '../types/auth.types';

export const authService = {
    login: async (dto: LoginDto): Promise<AuthResponse> => {
        return httpClient<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },

    register: async (dto: RegisterDto): Promise<AuthResponse> => {
        return httpClient<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },

    me: async (token?: string): Promise<User> => {
        return httpClient<User>('/auth/me', {}, token);
    },
};

