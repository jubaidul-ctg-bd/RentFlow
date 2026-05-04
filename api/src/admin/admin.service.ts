import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FlatsService } from '../flats/flats.service';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Flat, FlatDocument } from '../flats/schemas/flat.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Flat.name) private readonly flatModel: Model<FlatDocument>,
    private readonly flatsService: FlatsService,
    private readonly walletService: WalletService,
    private readonly emailService: EmailService,
  ) {}

  // Flat management
  async listFlats(status?: string, page = 1, limit = 20) {
    return this.flatsService.adminFindAll(status, page, limit);
  }

  async approveFlat(flatId: string, adminId: string) {
    const flat = await this.flatsService.adminApprove(flatId, adminId);
    await this.emailService.sendFlatApprovalEmail(flat.ownerId.toString(), flat.name, true);
    return flat;
  }

  async rejectFlat(flatId: string, adminId: string, reason: string) {
    const flat = await this.flatsService.adminReject(flatId, adminId, reason);
    await this.emailService.sendFlatApprovalEmail(flat.ownerId.toString(), flat.name, false, reason);
    return flat;
  }

  // User management
  async listUsers(page = 1, limit = 20, search?: string) {
    const filter = search
      ? {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.userModel.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async suspendUser(userId: string, suspend: boolean) {
    return this.userModel.findByIdAndUpdate(userId, { isSuspended: suspend }, { new: true }).exec();
  }

  // Reports
  async getReports() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalPaidPayments,
      monthlyPayments,
      dailyPayments,
      pendingFlats,
      activeFlats,
      pendingWithdrawals,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.paymentModel.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, gross: { $sum: '$amount' }, fees: { $sum: '$serviceFee' }, net: { $sum: '$netAmount' } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, gross: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: startOfDay } } },
        { $group: { _id: null, gross: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.flatModel.countDocuments({ status: 'pending' }),
      this.paymentModel.countDocuments({ status: 'paid' }),
      this.walletService.getPendingWithdrawals(1, 5),
    ]);

    return {
      users: { total: totalUsers },
      revenue: {
        allTime: totalPaidPayments[0] ?? { gross: 0, fees: 0, net: 0 },
        monthly: monthlyPayments[0] ?? { gross: 0, count: 0 },
        daily: dailyPayments[0] ?? { gross: 0, count: 0 },
      },
      payments: { total: activeFlats },
      pendingFlats,
      pendingWithdrawals: pendingWithdrawals.total,
    };
  }

  async getRevenueChart(months = 12) {
    const now = new Date();
    // Build start date = first day of (months) ago
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const rows: Array<{ _id: { year: number; month: number }; gross: number; fees: number; net: number }> =
      await this.paymentModel.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
            gross: { $sum: '$amount' },
            fees: { $sum: '$serviceFee' },
            net: { $sum: '$netAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

    // Build a full month-by-month series (fill gaps with 0)
    const map = new Map(
      rows.map((r) => [`${r._id.year}-${String(r._id.month).padStart(2, '0')}`, r]),
    );

    const series: Array<{ month: string; gross: number; fees: number; net: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const row = map.get(key);
      series.push({
        month: label,
        gross: row?.gross ?? 0,
        fees: row?.fees ?? 0,
        net: row?.net ?? 0,
      });
    }
    return series;
  }

  // Withdrawal management
  async listWithdrawals(page = 1, limit = 20) {
    return this.walletService.getPendingWithdrawals(page, limit);
  }

  async processWithdrawal(requestId: string, adminId: string, approve: boolean, note?: string) {
    return this.walletService.processWithdrawal(requestId, adminId, approve, note);
  }
}
