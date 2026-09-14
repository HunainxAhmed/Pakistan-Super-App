import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

class RequestOtpDto {
  phoneNumber: string;
}

class VerifyOtpDto {
  phoneNumber: string;
  otpCode: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('otp/request')
  @ApiOperation({ summary: 'Request 4-digit SMS OTP for Pakistani phone number' })
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.authService.requestOtp(body.phoneNumber);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code and retrieve access & refresh tokens' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.phoneNumber, body.otpCode);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get currently authenticated user profile' })
  async getMe(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Return default seeded user for seamless local mobile preview if token not passed
      return this.authService.getMe('cust-001');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = this.jwtService.decode(token);
      return this.authService.getMe(decoded.sub);
    } catch {
      return this.authService.getMe('cust-001');
    }
  }
}
