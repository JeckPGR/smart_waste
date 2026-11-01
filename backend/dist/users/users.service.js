"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const SAFE_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(q) {
        const where = {};
        if (q.role)
            where.role = q.role;
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
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        if (!user)
            throw new common_1.NotFoundException('User tidak ditemukan');
        return user;
    }
    async create(dto) {
        const email = dto.email.toLowerCase();
        await this.assertEmailFree(email);
        return this.prisma.user.create({
            data: {
                name: dto.name,
                email,
                phone: dto.phone,
                role: dto.role ?? client_1.Role.USER,
                password: await bcrypt.hash(dto.password, 10),
            },
            select: SAFE_SELECT,
        });
    }
    async update(id, dto, currentUserId) {
        const existing = await this.findOne(id);
        if (id === currentUserId && ((dto.role && dto.role !== client_1.Role.ADMIN) || dto.isActive === false)) {
            throw new common_1.BadRequestException('Tidak bisa menurunkan role atau menonaktifkan akun sendiri');
        }
        const data = {
            name: dto.name,
            phone: dto.phone,
            role: dto.role,
            isActive: dto.isActive,
        };
        if (dto.email) {
            const email = dto.email.toLowerCase();
            if (email !== existing.email)
                await this.assertEmailFree(email);
            data.email = email;
        }
        if (dto.password)
            data.password = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
    }
    async remove(id, currentUserId) {
        if (id === currentUserId)
            throw new common_1.BadRequestException('Tidak bisa menghapus akun sendiri');
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User dihapus' };
    }
    updateMe(id, dto) {
        return this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });
    }
    async changePassword(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
            throw new common_1.BadRequestException('Password saat ini salah');
        }
        await this.prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(dto.newPassword, 10) } });
        return { message: 'Password diganti' };
    }
    async assertEmailFree(email) {
        if (await this.prisma.user.findUnique({ where: { email } })) {
            throw new common_1.ConflictException('Email sudah terdaftar');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map