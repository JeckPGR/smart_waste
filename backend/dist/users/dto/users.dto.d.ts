import { Role } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
}
declare const UpdateUserDto_base: import("@nestjs/common", { with: { "resolution-mode": "import" } }).Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    isActive?: boolean;
}
export declare class UpdateProfileDto {
    name?: string;
    phone?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class QueryUsersDto extends PaginationDto {
    search?: string;
    role?: Role;
}
export {};
