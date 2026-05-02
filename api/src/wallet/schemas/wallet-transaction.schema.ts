import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ enum: ['credit', 'withdrawal'], required: true })
  type: 'credit' | 'withdrawal';

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  relatedPaymentId?: Types.ObjectId;

  @Prop({ enum: ['pending', 'completed', 'failed'], default: 'completed' })
  status: string;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
WalletTransactionSchema.index({ ownerId: 1, createdAt: -1 });
