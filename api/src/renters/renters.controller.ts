import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RentersService } from './renters.service';

class LinkRenterDto {
  @IsString() inviteCode: string;
}

@Controller('renters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentersController {
  constructor(private readonly rentersService: RentersService) {}

  @Post('link')
  @Roles('renter')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  linkFlat(
    @CurrentUser() user: { userId: string },
    @Body() dto: LinkRenterDto,
  ) {
    return this.rentersService.linkByCode(user.userId, dto.inviteCode);
  }

  @Get('my-flat')
  @Roles('renter')
  getMyFlat(@CurrentUser() user: { userId: string }) {
    return this.rentersService.findActiveLink(user.userId);
  }

  @Get('my-flats')
  @Roles('renter')
  getMyFlats(@CurrentUser() user: { userId: string }) {
    return this.rentersService.findActiveLinks(user.userId);
  }

  @Get('flats/:flatId/renters')
  @Roles('owner')
  getFlatRenters(@Param('flatId') flatId: string) {
    return this.rentersService.findAllByFlat(flatId);
  }

  @Delete('flats/:flatId/renters/:renterId')
  @Roles('owner')
  revokeAccess(
    @Param('flatId') flatId: string,
    @Param('renterId') renterId: string,
  ) {
    return this.rentersService.revokeAccess(flatId, renterId);
  }

  @Delete('unlink/:flatId')
  @Roles('renter')
  unlinkFlat(
    @CurrentUser() user: { userId: string },
    @Param('flatId') flatId: string,
  ) {
    return this.rentersService.unlinkFlat(user.userId, flatId);
  }
}
