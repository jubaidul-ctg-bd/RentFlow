import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) throw new BadRequestException('Missing raw body');

    try {
      await this.webhooksService.handleStripeEvent(rawBody, signature);
      return { received: true };
    } catch (err) {
      this.logger.error('Stripe webhook error', err);
      throw new BadRequestException('Webhook processing failed');
    }
  }
}
