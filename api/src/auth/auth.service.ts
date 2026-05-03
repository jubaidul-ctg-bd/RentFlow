import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      ...dto,
      passwordHash,
      verificationToken,
      roles: ['owner', 'renter'],
      isVerified: false,
    });

    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Registration successful. Please verify your email.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified)
      throw new UnauthorizedException('Please verify your email first');

    if (user.isSuspended)
      throw new UnauthorizedException('Account suspended');

    return this.issueTokens(user);
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) throw new BadRequestException('Invalid or expired token');

    // Already verified (e.g. double-invoke) — return success without error
    if (user.isVerified) return { message: 'Email verified successfully' };

    await this.usersService.markVerified(user._id.toString());
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'If that email exists, a reset link was sent.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3_600_000); // 1 hour

    await this.usersService.setPasswordResetToken(user._id.toString(), resetToken, expiry);
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If that email exists, a reset link was sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new BadRequestException('Invalid or expired token');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(user._id.toString(), passwordHash);

    return { message: 'Password reset successfully' };
  }

  private issueTokens(user: { _id: { toString(): string }; email: string; roles: string[] }) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user: { id: payload.sub, email: user.email, roles: user.roles } };
  }
}
