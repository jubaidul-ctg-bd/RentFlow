import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PaymentDocument } from '../payments/schemas/payment.schema';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly platformUrl: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');

    if (smtpHost) {
      const smtpPort = Number(this.configService.get<string>('SMTP_PORT', '587'));
      const smtpSecure =
        this.configService.get<string>('SMTP_SECURE', 'false').toLowerCase() === 'true';
      const smtpUser = this.configService.get<string>('SMTP_USER');
      const smtpPass = this.configService.get<string>('SMTP_PASS');

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number.isNaN(smtpPort) ? 587 : smtpPort,
        secure: smtpSecure,
        ...(smtpUser && smtpPass ? { auth: { user: smtpUser, pass: smtpPass } } : {}),
      });

      this.from = configService.get('EMAIL_FROM', smtpUser ?? 'noreply@rentflow.com');
      this.logger.log(`Email transport configured with SMTP host ${smtpHost}`);
    } else {
      const gmailUser = this.configService.getOrThrow<string>('GMAIL_USER');
      const gmailAppPassword = this.configService.getOrThrow<string>('GMAIL_APP_PASSWORD');

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      this.from = configService.get('EMAIL_FROM', gmailUser);
      this.logger.log('Email transport configured with Gmail service');
    }

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
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${String(err)}`);
    }
  }

  private verificationTemplate(url: string): string {
    return `
      <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

          <div style="padding:20px 24px;background:#111827;color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:0;">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">RentFlow</span>
                </td>
                <td align="right" style="font-size:13px;opacity:0.6;">Email Verification</td>
              </tr>
            </table>
          </div>

          <div style="padding:32px 24px 24px;">
            <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#111827;">
              Verify your email address
            </h2>
            <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#4b5563;">
              Thanks for signing up! Before you can sign in to RentFlow, we need to confirm
              your email address. Click the button below to complete verification.
            </p>
            <p style="margin:0 0 24px 0;font-size:14px;line-height:1.7;color:#4b5563;">
              This link will expire in <strong style="color:#111827;">24 hours</strong>.
            </p>

            <a href="${url}"
               style="display:inline-block;background:#2563eb;color:#ffffff;padding:13px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Verify Email Address
            </a>

            <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />

            <p style="margin:0 0 6px 0;font-size:13px;color:#6b7280;line-height:1.6;">
              If the button does not work, copy and paste this URL into your browser:
            </p>
            <p style="margin:0 0 24px 0;word-break:break-all;font-size:13px;line-height:1.6;">
              <a href="${url}" style="color:#2563eb;text-decoration:none;">${url}</a>
            </p>

            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              If you did not create a RentFlow account, you can safely ignore this email.
            </p>
          </div>

          <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} RentFlow. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `;
  }

  private passwordResetTemplate(url: string): string {
    return `
      <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="padding:20px 24px;background:#111827;color:#ffffff;">
            <h2 style="margin:0;font-size:20px;line-height:1.3;">Reset Your Password</h2>
          </div>

          <div style="padding:24px;">
            <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;">
              We received a request to reset your RentFlow account password.
            </p>
            <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;">
              Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
            </p>

            <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>

            <p style="margin:20px 0 8px 0;font-size:13px;color:#4b5563;line-height:1.6;">
              If the button does not work, copy and paste this URL into your browser:
            </p>
            <p style="margin:0 0 20px 0;word-break:break-all;font-size:13px;line-height:1.6;">
              <a href="${url}" style="color:#2563eb;text-decoration:none;">${url}</a>
            </p>

            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
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
