import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { RentersService } from '../renters/renters.service';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    private readonly configService: ConfigService,
    private readonly rentersService: RentersService,
    private readonly walletService: WalletService,
    private readonly emailService: EmailService,
  ) {
    this.stripe = new Stripe(configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async initiatePayment(renterId: string, month: string) {
    // Validate month format
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM');
    }

    const link = await this.rentersService.findActiveLink(renterId);
    if (!link) throw new BadRequestException('You are not linked to any flat');

    const flat = link.flatId as any;
    const flatId = flat._id.toString();

    // Check for any existing payment record for this renter/month/flat
    const existing = await this.paymentModel.findOne({
      flatId: new Types.ObjectId(flatId),
      renterId: new Types.ObjectId(renterId),
      month,
    }).exec();

    if (existing) {
      if (existing.status === 'paid') {
        throw new ConflictException(`Rent for ${month} already paid`);
      }
      // Delete pending/failed records so a fresh Checkout Session can be created
      await existing.deleteOne();
    }

    const feeRate = parseFloat(this.configService.get('SERVICE_FEE_PERCENT', '2.5')) / 100;
    const amount = flat.monthlyRent;
    const serviceFee = parseFloat((amount * feeRate).toFixed(2));
    const netAmount = parseFloat((amount - serviceFee).toFixed(2));

    const platformUrl = this.configService.get('PLATFORM_URL', 'http://localhost:3000');

    // Use Stripe Checkout Session — Stripe hosts the card form
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Rent — ${flat.name} (${month})`,
              description: flat.address,
            },
          },
        },
      ],
      metadata: { renterId, flatId, month, ownerId: flat.ownerId.toString() },
      success_url: `${platformUrl}/renter/payments?success=1&month=${month}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${platformUrl}/renter/dashboard?canceled=1`,
    });

    // Pre-create the payment record so we can track it via session id
    await this.paymentModel.create({
      flatId: new Types.ObjectId(flatId),
      renterId: new Types.ObjectId(renterId),
      ownerId: flat.ownerId,
      amount,
      serviceFee,
      netAmount,
      month,
      stripePaymentIntentId: session.id, // store session id; overwritten with PI id on webhook
      status: 'pending',
    });

    return {
      url: session.url,
      sessionId: session.id,
      amount,
      month,
    };
  }

  async verifySession(sessionId: string, renterId: string): Promise<{ status: string }> {
    // Retrieve session from Stripe to confirm payment actually succeeded
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== 'complete') {
      return { status: 'pending' };
    }

    // Ensure the session belongs to this renter
    if (session.metadata?.renterId !== renterId) {
      throw new BadRequestException('Session does not belong to this user');
    }

    await this.handleCheckoutCompleted(session);
    return { status: 'paid' };
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    // Find the pre-created record by the Checkout Session ID
    const payment = await this.paymentModel
      .findOne({ stripePaymentIntentId: session.id })
      .exec();
    if (!payment || payment.status === 'paid') return;

    // Update with the real PaymentIntent ID and mark as paid
    payment.stripePaymentIntentId = session.payment_intent as string ?? session.id;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    await this.walletService.credit(
      payment.ownerId.toString(),
      payment.netAmount,
      payment._id.toString(),
    );

    await this.emailService.sendPaymentReceiptEmails(payment);
  }

  async handleSuccessfulPayment(paymentIntentId: string): Promise<void> {
    const payment = await this.paymentModel.findOne({ stripePaymentIntentId: paymentIntentId }).exec();
    if (!payment || payment.status === 'paid') return;

    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // Credit wallet
    await this.walletService.credit(
      payment.ownerId.toString(),
      payment.netAmount,
      payment._id.toString(),
    );

    // Send receipt emails
    await this.emailService.sendPaymentReceiptEmails(payment);
  }

  async handleFailedPayment(paymentIntentId: string): Promise<void> {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status: 'failed' },
    ).exec();
  }

  async getHistory(renterId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.paymentModel
        .find({ renterId: new Types.ObjectId(renterId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('flatId', 'name address')
        .exec(),
      this.paymentModel.countDocuments({ renterId: new Types.ObjectId(renterId) }).exec(),
    ]);
    return { data, total, page, limit };
  }

  async findByIntentId(paymentIntentId: string): Promise<PaymentDocument | null> {
    return this.paymentModel.findOne({ stripePaymentIntentId: paymentIntentId }).exec();
  }
}
