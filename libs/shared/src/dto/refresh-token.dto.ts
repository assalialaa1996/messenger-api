import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
