import { PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateUserDto {
    @IsString() @MinLength(2) name!: string;
    @IsEmail() email!: string;
    @IsString() @MinLength(8) password!: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsEnum(Role) role?: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateProfileDto {
    @IsOptional() @IsString() @MinLength(2) name?: string;
    @IsOptional() @IsString() phone?: string;
}

export class ChangePasswordDto {
    @IsString() currentPassword!: string;
    @IsString() @MinLength(8) newPassword!: string;
}

export class QueryUsersDto extends PaginationDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @IsEnum(Role) role?: Role;
}