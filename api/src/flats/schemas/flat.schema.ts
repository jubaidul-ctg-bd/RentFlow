import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlatDocument = Flat & Document;

export type FlatStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

@Schema({ timestamps: true })
export class Flat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, min: 0 })
  monthlyRent: number;

  @Prop()
  description?: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected', 'inactive'] })
  status: FlatStatus;

  @Prop({ unique: true, sparse: true })
  inviteCode?: string;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({ default: false })
  requiresReApproval: boolean;
}

export const FlatSchema = SchemaFactory.createForClass(Flat);

FlatSchema.index({ ownerId: 1, status: 1 });
