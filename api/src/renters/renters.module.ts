import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RentersController } from './renters.controller';
import { RentersService } from './renters.service';
import { RenterLink, RenterLinkSchema } from './schemas/renter-link.schema';
import { FlatsModule } from '../flats/flats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RenterLink.name, schema: RenterLinkSchema }]),
    FlatsModule,
  ],
  controllers: [RentersController],
  providers: [RentersService],
  exports: [RentersService],
})
export class RentersModule {}
