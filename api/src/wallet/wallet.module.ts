import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletTransaction, WalletTransactionSchema } from './schemas/wallet-transaction.schema';
import { WithdrawalRequest, WithdrawalRequestSchema } from './schemas/withdrawal-request.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: WithdrawalRequest.name, schema: WithdrawalRequestSchema },
    ]),
    EmailModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
