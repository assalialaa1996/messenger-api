import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ required: true, description: 'Phone Number Attribute' })
  @IsNotEmpty()
  @IsPhoneNumber('IL')
  phone: string;
}
