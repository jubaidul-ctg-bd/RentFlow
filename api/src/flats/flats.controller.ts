import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FlatsService } from './flats.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';

@Controller('flats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}

  @Get()
  @Roles('owner')
  listMyFlats(@CurrentUser() user: { userId: string }) {
    return this.flatsService.findByOwner(user.userId);
  }

  @Post()
  @Roles('owner')
  createFlat(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateFlatDto,
  ) {
    return this.flatsService.create(user.userId, dto);
  }

  @Patch(':id')
  @Roles('owner')
  updateFlat(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateFlatDto,
  ) {
    return this.flatsService.update(id, user.userId, dto);
  }

  @Post(':id/invite')
  @Roles('owner')
  generateInvite(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.flatsService.generateInviteCode(id, user.userId);
  }

  @Delete(':id')
  @Roles('owner')
  deactivateFlat(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.flatsService.deactivate(id, user.userId);
  }
}
