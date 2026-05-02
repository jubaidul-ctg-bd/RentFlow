import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';

class ApproveRejectFlatDto {
  @IsBoolean() approve: boolean;
  @IsOptional() @IsString() reason?: string;
}

class ProcessWithdrawalDto {
  @IsBoolean() approve: boolean;
  @IsOptional() @IsString() note?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Flats
  @Get('flats')
  listFlats(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.listFlats(status, Number(page), Number(limit));
  }

  @Patch('flats/:id')
  @HttpCode(HttpStatus.OK)
  manageFlat(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ApproveRejectFlatDto,
  ) {
    if (dto.approve) {
      return this.adminService.approveFlat(id, user.userId);
    }
    return this.adminService.rejectFlat(id, user.userId, dto.reason ?? 'No reason provided');
  }

  // Users
  @Get('users')
  listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(Number(page), Number(limit), search);
  }

  @Patch('users/:id/suspend')
  suspendUser(
    @Param('id') id: string,
    @Body('suspend') suspend: boolean,
  ) {
    return this.adminService.suspendUser(id, suspend);
  }

  // Reports
  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  // Withdrawals
  @Get('withdrawals')
  listWithdrawals(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.listWithdrawals(Number(page), Number(limit));
  }

  @Post('withdrawals/:id/process')
  @HttpCode(HttpStatus.OK)
  processWithdrawal(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.adminService.processWithdrawal(id, user.userId, dto.approve, dto.note);
  }
}
