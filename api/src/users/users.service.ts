import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ verificationToken: token }).exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ passwordResetToken: token, passwordResetExpiry: { $gt: new Date() } })
      .exec();
  }

  async markVerified(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      isVerified: true,
      $unset: { verificationToken: 1 },
    }).exec();
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    }).exec();
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      passwordHash,
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
    }).exec();
  }

  async addRole(userId: string, role: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { roles: role } },
      { new: true },
    ).exec();
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'profilePhoto'>>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true }).exec();
  }
}
