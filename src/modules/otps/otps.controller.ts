import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RETRY_DELAY } from './constants';
import { CreateOtpDto, VerifyOtpDto } from './dto';
import { OtpResponse } from './otps.model';
import { OtpsService } from './otps.service';

@ApiTags('☄️ otps')
@Controller()
export class OtpsController {
  constructor(
    private readonly otpsService: OtpsService,
    private readonly config: ConfigService,
  ) {}

  private wrapSuccess(data: Partial<OtpResponse>): OtpResponse {
    return {
      success: true,
      ...data,
    } as OtpResponse;
  }

  @Post('/auth/otp')
  @ApiOperation({ summary: 'Создание отп кода' })
  @ApiResponse({
    status: 200,
    description: 'create otp',
    type: OtpResponse,
  })
  async createOtp(@Body() createOtpDto: CreateOtpDto): Promise<OtpResponse> {
    const existingOtp = await this.otpsService.get(createOtpDto.phone);

    if (existingOtp) {
      const { retryDelay, created } = existingOtp;

      if (created + retryDelay > Date.now()) {
        return this.wrapSuccess({
          retryDelay: RETRY_DELAY - (Date.now() - created),
        });
      }

      await this.otpsService.delete(createOtpDto.phone);
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    await this.otpsService.set(createOtpDto.phone, code, RETRY_DELAY);

    const isDev = this.config.get('NODE_ENV') !== 'production';
    if (isDev) {
      return this.wrapSuccess({ retryDelay: RETRY_DELAY, code });
    }

    return this.wrapSuccess({ retryDelay: RETRY_DELAY });
  }

  @Post('/auth/otp/verify')
  @ApiOperation({ summary: 'Верификация OTP кода' })
  @ApiResponse({
    status: 200,
    description: 'verify otp',
    type: OtpResponse,
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<OtpResponse> {
    const otp = await this.otpsService.get(verifyOtpDto.phone);

    if (!otp) {
      return this.wrapSuccess({
        success: false,
        message: 'OTP not found',
      });
    }

    if (otp.code !== verifyOtpDto.code) {
      return this.wrapSuccess({
        success: false,
        message: 'Invalid code',
      });
    }

    await this.otpsService.delete(verifyOtpDto.phone);

    return this.wrapSuccess({ success: true });
  }
}
