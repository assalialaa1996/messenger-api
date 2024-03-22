import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class ValidateOtpDto {
  @ApiProperty({ required: true, description: 'Phone Number Attribute' })
  @IsNotEmpty()
  @IsPhoneNumber('IL')
  phone: string;

  @ApiProperty({ required: true, description: 'Received OTP Code' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string;
}
