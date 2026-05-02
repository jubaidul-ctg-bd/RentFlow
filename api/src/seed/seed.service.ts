import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';

/**
 * Seeds a default admin user on startup when running in development.
 * Uses ADMIN_EMAIL / ADMIN_PASSWORD from env (defaults shown below).
 * Safe to run repeatedly — skips if the admin already exists.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get('NODE_ENV') === 'production') return;
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const email =
      (this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@rentflow.com').toLowerCase();
    const password =
      this.configService.get<string>('ADMIN_PASSWORD') ?? 'Admin@1234';

    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      if (!existing.roles.includes('admin')) {
        await this.userModel.findByIdAndUpdate(existing._id, {
          $addToSet: { roles: 'admin' },
        });
        this.logger.log(`Upgraded existing user ${email} to admin role`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.userModel.create({
      firstName: 'Admin',
      lastName: 'RentFlow',
      email,
      passwordHash,
      roles: ['admin'],
      isVerified: true,
    });

    this.logger.log(`✔ Admin user seeded → ${email} / ${password}`);
  }
}
