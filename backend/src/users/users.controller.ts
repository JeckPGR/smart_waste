import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/auth-user';
import { ChangePasswordDto, CreateUserDto, QueryUsersDto, UpdateProfileDto, UpdateUserDto } from './dto/users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private users: UsersService) { }

    // --- endpoint untuk diri sendiri (harus di atas :id) ---
    @Patch('me')
    updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
        return this.users.updateMe(user.id, dto);
    }

    @Patch('me/password')
    changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
        return this.users.changePassword(user.id, dto);
    }

    // --- admin ---
    @Get()
    @Roles(Role.ADMIN)
    findAll(@Query() q: QueryUsersDto) {
        return this.users.findAll(q);
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateUserDto) {
        return this.users.create(dto);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.users.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthUser) {
        return this.users.update(id, dto, user.id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
        return this.users.remove(id, user.id);
    }
}