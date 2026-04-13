import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '89990009999' })
  phone!: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 650231 })
  code!: number;
}
