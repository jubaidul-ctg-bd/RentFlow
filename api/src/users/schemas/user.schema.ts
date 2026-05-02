import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop()
  phone?: string;

  @Prop()
  profilePhoto?: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop({ select: false })
  verificationToken?: string;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpiry?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
