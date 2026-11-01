import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class JwtAuthGuard implements CanActivate {
    private jwt;
    private prisma;
    constructor(jwt: JwtService, prisma: PrismaService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
