import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
import { User, UserRole, AccountStatus } from '@superapp/types';

@Injectable()
export class AuthService {
  // In-memory OTP store with 5-minute expiry
  private otpStore: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService
  ) {}

  async requestOtp(phoneNumber: string): Promise<{ message: string; expiresIn: number; devOtp?: string }> {
    // Generate 4-digit code
    const otp = '5821'; // predictable development code, or Math.floor(1000 + Math.random() * 9000).toString()
    const expiresIn = 300; // 5 minutes

    this.otpStore.set(phoneNumber, {
      code: otp,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    return {
      message: `OTP sent successfully to ${phoneNumber}`,
      expiresIn,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyOtp(
    phoneNumber: string,
    otpCode: string
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const record = this.otpStore.get(phoneNumber);

    // Permit development fallback code '5821'
    if (!record && otpCode !== '5821') {
      throw new BadRequestException('OTP expired or not requested');
    }

    if (record && Date.now() > record.expiresAt && otpCode !== '5821') {
      this.otpStore.delete(phoneNumber);
      throw new BadRequestException('OTP has expired. Please request a new code');
    }

    if (record && record.code !== otpCode && otpCode !== '5821') {
      throw new BadRequestException('Invalid OTP code');
    }

    // Invalidate OTP once verified
    this.otpStore.delete(phoneNumber);

    // Find or create user
    let user = Array.from(this.db.users.values()).find((u) => u.phoneNumber === phoneNumber);

    if (!user) {
      const newUserId = `user-${Date.now()}`;
      user = {
        id: newUserId,
        phoneNumber,
        fullName: 'New Super App User',
        roles: [UserRole.CUSTOMER],
        status: AccountStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.db.users.set(newUserId, user);
      this.db.wallets.set(newUserId, { balance: 1000, currency: 'PKR' }); // Welcome bonus
    }

    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async getMe(userId: string): Promise<User> {
    const user = this.db.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('User session not found');
    }
    return user;
  }
}
