import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
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
    me(id: string): Promise<Omit<{
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
    private buildResponse;
}
