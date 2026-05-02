import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PaymentDocument } from '../payments/schemas/payment.schema';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly platformUrl: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.getOrThrow<string>('EMAIL_PROVIDER_API_KEY'));
    this.from = configService.get('EMAIL_FROM', 'noreply@rentflow.com');
    this.platformUrl = configService.get('PLATFORM_URL', 'https://rentflow.com');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${this.platformUrl}/auth/verify-email?token=${token}`;
    await this.send(email, 'Verify your RentFlow email', this.verificationTemplate(url));
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = `${this.platformUrl}/auth/reset-password?token=${token}`;
    await this.send(email, 'Reset your RentFlow password', this.passwordResetTemplate(url));
  }

  async sendPaymentReceiptEmails(payment: PaymentDocument): Promise<void> {
    await Promise.allSettled([
      this.send(
        payment.renterId.toString(),
        `Rent Payment Confirmed – ${payment.month}`,
        this.paymentReceiptTemplate(payment, 'renter'),
      ),
      this.send(
        payment.ownerId.toString(),
        `Rent Received – ${payment.month}`,
        this.paymentReceiptTemplate(payment, 'owner'),
      ),
    ]);
  }

  async sendFlatApprovalEmail(
    ownerId: string,
    flatName: string,
    approved: boolean,
    reason?: string,
  ): Promise<void> {
    const subject = approved
      ? `Your flat "${flatName}" has been approved`
      : `Your flat "${flatName}" was not approved`;

    await this.send(
      ownerId,
      subject,
      this.flatApprovalTemplate(flatName, approved, reason),
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${String(err)}`);
    }
  }

  private verificationTemplate(url: string): string {
    return `
      <h2>Welcome to RentFlow</h2>
      <p>Please verify your email address by clicking the button below.</p>
      <a href="${url}" style="background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `;
  }

  private passwordResetTemplate(url: string): string {
    return `
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${url}" style="background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        Reset Password
      </a>
      <p>If you didn't request this, ignore this email.</p>
    `;
  }

  private paymentReceiptTemplate(payment: PaymentDocument, role: 'renter' | 'owner'): string {
    return `
      <h2>Payment ${role === 'renter' ? 'Confirmation' : 'Received'}</h2>
      <table>
        <tr><td><strong>Month</strong></td><td>${payment.month}</td></tr>
        <tr><td><strong>Amount</strong></td><td>$${payment.amount.toFixed(2)}</td></tr>
        ${role === 'owner' ? `<tr><td><strong>Service Fee</strong></td><td>$${payment.serviceFee.toFixed(2)}</td></tr>
        <tr><td><strong>Net Credited</strong></td><td>$${payment.netAmount.toFixed(2)}</td></tr>` : ''}
        <tr><td><strong>Transaction ID</strong></td><td>${payment.stripePaymentIntentId}</td></tr>
        <tr><td><strong>Date</strong></td><td>${payment.paidAt?.toLocaleDateString() ?? ''}</td></tr>
      </table>
    `;
  }

  private flatApprovalTemplate(name: string, approved: boolean, reason?: string): string {
    return `
      <h2>Flat ${approved ? 'Approved' : 'Not Approved'}</h2>
      <p>Your flat <strong>${name}</strong> has been ${approved ? 'approved' : 'rejected'}.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      ${approved ? '<p>You can now generate an invite code for your tenant.</p>' : ''}
      <a href="${this.platformUrl}/owner/flats" style="background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        View Dashboard
      </a>
    `;
  }
}
