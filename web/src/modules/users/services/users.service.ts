import { httpClient } from '@/shared/lib/http-client';
import {
    ChangePasswordDto,
    CreateUserDto,
    PaginatedUsers,
    QueryUsersParams,
    UpdateProfileDto,
    UpdateUserDto,
    User,
} from '../types/users.types';

export const usersService = {
    list: async (params: QueryUsersParams = {}): Promise<PaginatedUsers> => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page.toString());
        if (params.limit) query.set('limit', params.limit.toString());
        if (params.search) query.set('search', params.search);
        if (params.role) query.set('role', params.role);
        return httpClient<PaginatedUsers>(`/users?${query.toString()}`);
    },

    get: async (id: string): Promise<User> => {
        return httpClient<User>(`/users/${id}`);
    },

    create: async (dto: CreateUserDto): Promise<User> => {
        return httpClient<User>('/users', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },

    update: async (id: string, dto: UpdateUserDto): Promise<User> => {
        return httpClient<User>(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return httpClient<{ message: string }>(`/users/${id}`, {
            method: 'DELETE',
        });
    },

    updateMe: async (dto: UpdateProfileDto): Promise<User> => {
        return httpClient<User>('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
    },

    changePassword: async (dto: ChangePasswordDto): Promise<{ message: string }> => {
        return httpClient<{ message: string }>('/users/me/password', {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
    },
};

