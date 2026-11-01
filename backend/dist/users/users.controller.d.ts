import type { AuthUser } from '../common/types/auth-user';
import { ChangePasswordDto, CreateUserDto, QueryUsersDto, UpdateProfileDto, UpdateUserDto } from './dto/users.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    updateMe(user: AuthUser, dto: UpdateProfileDto): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
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
    update(id: string, dto: UpdateUserDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: AuthUser): Promise<{
        message: string;
    }>;
}
