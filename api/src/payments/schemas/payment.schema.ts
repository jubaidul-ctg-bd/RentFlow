import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Flat', required: true })
  flatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  renterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  serviceFee: number;

  @Prop({ required: true })
  netAmount: number;

  @Prop({ required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ })
  month: string; // YYYY-MM

  @Prop({ required: true })
  stripePaymentIntentId: string;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'failed', 'refunded'] })
  status: PaymentStatus;

  @Prop()
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ renterId: 1, month: 1, flatId: 1 }, { unique: true });
PaymentSchema.index({ flatId: 1, status: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true });
