import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
        status: string;
        service: string;
        environment: string;
        timestamp: string;
        uptimeSeconds: number;
        database: string;
    }>;
    ping(): {
        pong: boolean;
        time: string;
    };
}
