import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlatsController } from './flats.controller';
import { FlatsService } from './flats.service';
import { Flat, FlatSchema } from './schemas/flat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flat.name, schema: FlatSchema }])],
  controllers: [FlatsController],
  providers: [FlatsService],
  exports: [FlatsService],
})
export class FlatsModule {}
