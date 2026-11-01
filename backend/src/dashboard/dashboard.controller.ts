import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/auth-user';
import { DashboardService } from './dashboard.service';
import { TrendQueryDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private dashboard: DashboardService) { }

    @Get('stats')
    @Roles(Role.ADMIN)
    stats() {
        return this.dashboard.stats();
    }

    @Get('trend')
    @Roles(Role.ADMIN)
    trend(@Query() q: TrendQueryDto) {
        return this.dashboard.trend(q.days);
    }

    @Get('me')
    me(@CurrentUser() user: AuthUser) {
        return this.dashboard.me(user.id);
    }
}