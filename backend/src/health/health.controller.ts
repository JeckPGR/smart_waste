import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    @ApiOperation({ summary: 'Periksa status kesehatan API, uptime & koneksi database Supabase' })
    @ApiResponse({ status: 200, description: 'API dan Database berfungsi normal' })
    async getHealth() {
        return this.healthService.checkHealth();
    }

    @Get('ping')
    @ApiOperation({ summary: 'Simple lightweight ping endpoint untuk keep-alive cron & UptimeRobot' })
    @ApiResponse({ status: 200, description: 'Pong response' })
    ping() {
        return { pong: true, time: new Date().toISOString() };
    }
}

