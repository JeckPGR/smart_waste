import type { AuthUser } from '../common/types/auth-user';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: Omit<{
            id: string;
            email: string;
            name: string;
            password: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }, "password">;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: Omit<{
            id: string;
            email: string;
            name: string;
            password: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }, "password">;
    }>;
    me(user: AuthUser): Promise<Omit<{
        id: string;
        email: string;
        name: string;
        password: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
}
