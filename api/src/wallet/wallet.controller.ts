import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsString, IsObject, Min } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WalletService } from './wallet.service';

class WithdrawDto {
  @IsNumber() @Min(1) amount: number;
  @IsObject() bankDetails: { accountName: string; accountNumber: string; bankName: string };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles('owner')
  getWallet(
    @CurrentUser() user: { userId: string },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.walletService.getWalletDashboard(user.userId, Number(page), Number(limit));
  }

  @Post('withdraw')
  @Roles('owner')
  requestWithdrawal(
    @CurrentUser() user: { userId: string },
    @Body() dto: WithdrawDto,
  ) {
    return this.walletService.requestWithdrawal(user.userId, dto.amount, dto.bankDetails);
  }
}
