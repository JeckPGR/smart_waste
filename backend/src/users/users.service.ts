import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, CreateUserDto, QueryUsersDto, UpdateProfileDto, UpdateUserDto } from './dto/users.dto';

const SAFE_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(q: QueryUsersDto) {
        const where: Prisma.UserWhereInput = {};
        if (q.role) where.role = q.role;
        if (q.search) {
            where.OR = [
                { name: { contains: q.search, mode: 'insensitive' } },
                { email: { contains: q.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                select: SAFE_SELECT,
                orderBy: { createdAt: 'desc' },
                skip: (q.page - 1) * q.limit,
                take: q.limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        if (!user) throw new NotFoundException('User tidak ditemukan');
        return user;
    }

    async create(dto: CreateUserDto) {
        const email = dto.email.toLowerCase();
        await this.assertEmailFree(email);
        return this.prisma.user.create({
            data: {
                name: dto.name,
                email,
                phone: dto.phone,
                role: dto.role ?? Role.USER,
                password: await bcrypt.hash(dto.password, 10),
            },
            select: SAFE_SELECT,
        });
    }

    async update(id: string, dto: UpdateUserDto, currentUserId: string) {
        const existing = await this.findOne(id);
        if (id === currentUserId && ((dto.role && dto.role !== Role.ADMIN) || dto.isActive === false)) {
            throw new BadRequestException('Tidak bisa menurunkan role atau menonaktifkan akun sendiri');
        }
        const data: Prisma.UserUpdateInput = {
            name: dto.name,
            phone: dto.phone,
            role: dto.role,
            isActive: dto.isActive,
        };
        if (dto.email) {
            const email = dto.email.toLowerCase();
            if (email !== existing.email) await this.assertEmailFree(email);
            data.email = email;
        }
        if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
    }

    async remove(id: string, currentUserId: string) {
        if (id === currentUserId) throw new BadRequestException('Tidak bisa menghapus akun sendiri');
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User dihapus' };
    }

    updateMe(id: string, dto: UpdateProfileDto) {
        return this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });
    }

    async changePassword(id: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
            throw new BadRequestException('Password saat ini salah');
        }
        await this.prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(dto.newPassword, 10) } });
        return { message: 'Password diganti' };
    }

    private async assertEmailFree(email: string) {
        if (await this.prisma.user.findUnique({ where: { email } })) {
            throw new ConflictException('Email sudah terdaftar');
        }
    }
}