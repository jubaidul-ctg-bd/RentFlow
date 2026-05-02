import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalRequestDocument = WithdrawalRequest & Document;

@Schema({ timestamps: true })
export class WithdrawalRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Object, required: true })
  bankDetails: {
    accountName: string;
    accountNumber: string; // stored encrypted via app layer
    bankName: string;
  };

  @Prop({ enum: ['pending', 'processed', 'rejected'], default: 'pending' })
  status: 'pending' | 'processed' | 'rejected';

  @Prop()
  adminNote?: string;

  @Prop()
  processedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy?: Types.ObjectId;
}

export const WithdrawalRequestSchema = SchemaFactory.createForClass(WithdrawalRequest);
WithdrawalRequestSchema.index({ ownerId: 1, status: 1 });
