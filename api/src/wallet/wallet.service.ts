import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';
import { WithdrawalRequest, WithdrawalRequestDocument } from './schemas/withdrawal-request.schema';
import { EmailService } from '../email/email.service';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(WalletTransaction.name)
    private readonly txModel: Model<WalletTransactionDocument>,
    @InjectModel(WithdrawalRequest.name)
    private readonly withdrawalModel: Model<WithdrawalRequestDocument>,
    private readonly emailService: EmailService,
  ) {}

  async getBalance(ownerId: string): Promise<number> {
    const [credits, withdrawals] = await Promise.all([
      this.txModel.aggregate([
        { $match: { ownerId: new Types.ObjectId(ownerId), type: 'credit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.txModel.aggregate([
        { $match: { ownerId: new Types.ObjectId(ownerId), type: 'withdrawal', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    return (credits[0]?.total ?? 0) - (withdrawals[0]?.total ?? 0);
  }

  async getWalletDashboard(ownerId: string, page = 1, limit = 20) {
    const [balance, transactions, total] = await Promise.all([
      this.getBalance(ownerId),
      this.txModel
        .find({ ownerId: new Types.ObjectId(ownerId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.txModel.countDocuments({ ownerId: new Types.ObjectId(ownerId) }).exec(),
    ]);
    return { balance, transactions, total, page, limit };
  }

  async credit(ownerId: string, amount: number, paymentId: string): Promise<void> {
    await this.txModel.create({
      ownerId: new Types.ObjectId(ownerId),
      type: 'credit',
      amount,
      relatedPaymentId: new Types.ObjectId(paymentId),
      status: 'completed',
    });
  }

  async requestWithdrawal(
    ownerId: string,
    amount: number,
    bankDetails: { accountName: string; accountNumber: string; bankName: string },
  ): Promise<WithdrawalRequestDocument> {
    const balance = await this.getBalance(ownerId);
    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }

    const encryptedAccount = encrypt(bankDetails.accountNumber);

    return this.withdrawalModel.create({
      ownerId: new Types.ObjectId(ownerId),
      amount,
      bankDetails: { ...bankDetails, accountNumber: encryptedAccount },
      status: 'pending',
    });
  }

  async processWithdrawal(
    requestId: string,
    adminId: string,
    approve: boolean,
    note?: string,
  ): Promise<WithdrawalRequestDocument> {
    const request = await this.withdrawalModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Withdrawal request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request already processed');

    request.status = approve ? 'processed' : 'rejected';
    request.adminNote = note;
    request.processedAt = new Date();
    request.processedBy = new Types.ObjectId(adminId);
    await request.save();

    if (approve) {
      await this.txModel.create({
        ownerId: request.ownerId,
        type: 'withdrawal',
        amount: request.amount,
        status: 'completed',
      });
    }

    return request;
  }

  async getPendingWithdrawals(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.withdrawalModel
        .find({ status: 'pending' })
        .populate('ownerId', 'firstName lastName email')
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.withdrawalModel.countDocuments({ status: 'pending' }).exec(),
    ]);
    return { data, total, page, limit };
  }
}
