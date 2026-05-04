import { Controller, Post, Get, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

class InitiatePaymentDto {
  @IsString() flatId: string;
  @IsString() month: string;
}

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @Roles('renter')
  initiatePayment(
    @CurrentUser() user: { userId: string },
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(user.userId, dto.flatId, dto.month);
  }

  @Get('verify-session')
  @Roles('renter')
  verifySession(
    @CurrentUser() user: { userId: string },
    @Query('session_id') sessionId: string,
  ) {
    if (!sessionId) throw new BadRequestException('Missing session_id');
    return this.paymentsService.verifySession(sessionId, user.userId);
  }

  @Get('history')
  @Roles('renter')
  getHistory(
    @CurrentUser() user: { userId: string },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.paymentsService.getHistory(user.userId, Number(page), Number(limit));
  }
}
