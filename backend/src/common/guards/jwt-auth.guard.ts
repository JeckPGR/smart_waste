import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwt: JwtService,
        private prisma: PrismaService,
    ) { }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        if (type !== 'Bearer' || !token) throw new UnauthorizedException();

        let payload: { sub: string };
        try {
            payload = await this.jwt.verifyAsync(token);
        } catch {
            throw new UnauthorizedException('Token tidak valid');
        }

        // cek ke DB: role terbaru + akun nonaktif langsung ditolak
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, role: true, isActive: true },
        });
        if (!user || !user.isActive) throw new UnauthorizedException('Akun tidak aktif');

        req.user = { id: user.id, role: user.role };
        return true;
    }
}