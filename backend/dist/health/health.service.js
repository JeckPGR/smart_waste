"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthService = HealthService_1 = class HealthService {
    config;
    prisma;
    logger = new common_1.Logger(HealthService_1.name);
    pingTimer = null;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    async checkHealth() {
        let dbStatus = 'connected';
        try {
            await this.prisma.$queryRawUnsafe('SELECT 1');
        }
        catch (err) {
            dbStatus = `disconnected: ${err?.message || 'unknown error'}`;
        }
        return {
            status: 'ok',
            service: 'smart-waste-backend',
            environment: this.config.get('NODE_ENV') || 'development',
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
            database: dbStatus,
        };
    }
    onApplicationBootstrap() {
        const rawPublicUrl = this.config.get('PUBLIC_URL') || 'https://smart-waste-backend-50bs.onrender.com';
        const publicUrl = rawPublicUrl.replace(/\/$/, '');
        setTimeout(() => this.sendKeepAlivePing(publicUrl), 15_000);
        this.pingTimer = setInterval(() => {
            this.sendKeepAlivePing(publicUrl);
        }, 10 * 60 * 1000);
        this.logger.log(`Render Keep-Alive Pinger aktif. Target: ${publicUrl}/api/v1/health (interval: 10 menit)`);
    }
    async sendKeepAlivePing(publicUrl) {
        if (!publicUrl.startsWith('http'))
            return;
        const healthUrl = `${publicUrl}/api/v1/health`;
        try {
            const res = await fetch(healthUrl, {
                headers: { 'User-Agent': 'SmartWaste-KeepAlive-Pinger/1.0' },
                signal: AbortSignal.timeout(15_000),
            });
            if (res.ok) {
                this.logger.log(`[Keep-Alive] Ping sukses ke ${healthUrl} (${res.status} OK) - Server Render tetap terjaga!`);
            }
            else {
                this.logger.warn(`[Keep-Alive] Ping mendapat respon status: ${res.status}`);
            }
        }
        catch (err) {
            this.logger.debug(`[Keep-Alive] Ping belum terjangkau: ${err?.message || err}`);
        }
    }
    onApplicationShutdown() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], HealthService);
//# sourceMappingURL=health.service.js.map