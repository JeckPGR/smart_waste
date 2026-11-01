import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, CreateUserDto, QueryUsersDto, UpdateProfileDto, UpdateUserDto } from './dto/users.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(q: QueryUsersDto): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, currentUserId: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
    updateMe(id: string, dto: UpdateProfileDto): Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    changePassword(id: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    private assertEmailFree;
}
