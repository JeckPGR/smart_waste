import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { sanitizeUser } from '../common/utils/sanitize-user';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const email = dto.email.toLowerCase();
        if (await this.prisma.user.findUnique({ where: { email } })) {
            throw new ConflictException('Email sudah terdaftar');
        }
        const user = await this.prisma.user.create({
            data: { name: dto.name, email, phone: dto.phone, password: await bcrypt.hash(dto.password, 10) },
        }); // role otomatis USER
        return this.buildResponse(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Email atau password salah');
        }
        if (!user.isActive) throw new ForbiddenException('Akun dinonaktifkan');
        return this.buildResponse(user);
    }

    async me(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User tidak ditemukan');
        return sanitizeUser(user);
    }

    private async buildResponse(user: User) {
        const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
        return { accessToken, user: sanitizeUser(user) };
    }
}