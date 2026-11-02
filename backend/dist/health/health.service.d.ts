import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class HealthService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private pingTimer;
    constructor(config: ConfigService, prisma: PrismaService);
    checkHealth(): Promise<{
        status: string;
        service: string;
        environment: string;
        timestamp: string;
        uptimeSeconds: number;
        database: string;
    }>;
    onApplicationBootstrap(): void;
    private sendKeepAlivePing;
    onApplicationShutdown(): void;
}
