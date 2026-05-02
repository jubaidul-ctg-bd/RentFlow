import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RenterLinkDocument = RenterLink & Document;

@Schema({ timestamps: true })
export class RenterLink {
  @Prop({ type: Types.ObjectId, ref: 'Flat', required: true })
  flatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  renterId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const RenterLinkSchema = SchemaFactory.createForClass(RenterLink);

RenterLinkSchema.index({ flatId: 1, renterId: 1 }, { unique: true });
RenterLinkSchema.index({ renterId: 1, isActive: 1 });
