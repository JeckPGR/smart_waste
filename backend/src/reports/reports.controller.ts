import {
    Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/auth-user';
import { imageUploadOptions } from '../common/upload.options';
import { CreateReportDto, QueryReportsDto, UpdateReportDto, UpdateStatusDto } from './dto/reports.dto';
import { ReportsService } from './reports.service';

const uploadBody = {
    schema: {
        type: 'object',
        properties: {
            image: { type: 'string', format: 'binary' },
            description: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            address: { type: 'string' },
            category: { type: 'string', enum: ['ORGANIC', 'PLASTIC', 'PAPER'] },
            aiConfidence: { type: 'number' },
        },
    },
};

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
    constructor(private reports: ReportsService) { }

    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBody(uploadBody)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions))
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateReportDto, @UploadedFile() file?: Express.Multer.File) {
        return this.reports.create(user.id, dto, file);
    }

    @Get('my')
    findMine(@CurrentUser() user: AuthUser, @Query() q: QueryReportsDto) {
        return this.reports.list(q, user.id);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll(@Query() q: QueryReportsDto) {
        return this.reports.list(q);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
        return this.reports.findOne(id, user);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    updateStatus(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateStatusDto) {
        return this.reports.updateStatus(id, user.id, dto);
    }

    @Patch(':id')
    @ApiConsumes('multipart/form-data')
    @ApiBody(uploadBody)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions))
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateReportDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.reports.update(id, user, dto, file);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
        return this.reports.remove(id, user);
    }
}