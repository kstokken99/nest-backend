import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message?: string;
}

export class OtpResponse extends BaseResponse {
  @ApiProperty({
    example: 120000,
    description: 'Время запроса повторного отп кода в мс',
  })
  retryDelay?: number;

  @ApiProperty({
    example: 650231,
    description: 'OTP код (только для разработки)',
  })
  code?: number;
}
