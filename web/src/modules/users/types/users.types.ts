import { Role, User } from '@/modules/auth/types/auth.types';
import { PaginationMeta } from '@/modules/reports/types/reports.types';

export type { PaginationMeta, Role, User };

export interface QueryUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
}

export interface PaginatedUsers {
    data: User[];
    meta: PaginationMeta;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
}

export interface UpdateUserDto {
    name?: string;
    phone?: string;
    role?: Role;
    isActive?: boolean;
}

export interface UpdateProfileDto {
    name?: string;
    phone?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
