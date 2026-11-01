export type Role = 'ADMIN' | 'USER';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

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

