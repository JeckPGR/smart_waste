import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(HealthService.name);
    private pingTimer: NodeJS.Timeout | null = null;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    async checkHealth() {
        let dbStatus = 'connected';
        try {
            await this.prisma.$queryRawUnsafe('SELECT 1');
        } catch (err: any) {
            dbStatus = `disconnected: ${err?.message || 'unknown error'}`;
        }

        return {
            status: 'ok',
            service: 'smart-waste-backend',
            environment: this.config.get<string>('NODE_ENV') || 'development',
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
            database: dbStatus,
        };
    }

    onApplicationBootstrap() {
        // Keep-alive self-ping khusus untuk Render agar tidak sleep / spin-down (setiap 10 menit)
        const rawPublicUrl =
            this.config.get<string>('PUBLIC_URL') || 'https://smart-waste-backend-50bs.onrender.com';
        const publicUrl = rawPublicUrl.replace(/\/$/, '');

        // Jalankan ping pertama setelah 15 detik bootstrap
        setTimeout(() => this.sendKeepAlivePing(publicUrl), 15_000);

        // Ulangi setiap 10 menit (600.000 ms) - aman sebelum 15 menit idle threshold Render
        this.pingTimer = setInterval(() => {
            this.sendKeepAlivePing(publicUrl);
        }, 10 * 60 * 1000);

        this.logger.log(`Render Keep-Alive Pinger aktif. Target: ${publicUrl}/api/v1/health (interval: 10 menit)`);
    }

    private async sendKeepAlivePing(publicUrl: string) {
        if (!publicUrl.startsWith('http')) return;

        const healthUrl = `${publicUrl}/api/v1/health`;
        try {
            const res = await fetch(healthUrl, {
                headers: { 'User-Agent': 'SmartWaste-KeepAlive-Pinger/1.0' },
                signal: AbortSignal.timeout(15_000),
            });
            if (res.ok) {
                this.logger.log(`[Keep-Alive] Ping sukses ke ${healthUrl} (${res.status} OK) - Server Render tetap terjaga!`);
            } else {
                this.logger.warn(`[Keep-Alive] Ping mendapat respon status: ${res.status}`);
            }
        } catch (err: any) {
            this.logger.debug(`[Keep-Alive] Ping belum terjangkau: ${err?.message || err}`);
        }
    }

    onApplicationShutdown() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }
}
