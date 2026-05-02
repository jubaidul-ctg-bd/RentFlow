import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class WebhooksService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
  ) {
    this.stripe = new Stripe(configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
  }

  async handleStripeEvent(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    if (this.webhookSecret) {
      // Verify signature when a secret is configured
      try {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
      } catch {
        throw new Error('Invalid Stripe webhook signature');
      }
    } else {
      // No secret configured — parse the raw body directly (dev / local only)
      this.logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
      event = JSON.parse(rawBody.toString()) as Stripe.Event;
    }

    this.logger.log(`Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.paymentsService.handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.paymentsService.handleSuccessfulPayment(pi.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.paymentsService.handleFailedPayment(pi.id);
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }
}
