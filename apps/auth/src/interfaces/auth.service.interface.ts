import { UserEntity, UserJwt } from '@app/shared';
import { ExistingUserDTO } from '../dtos/existing-user.dto';
import { SendOtpDto } from '@app/shared/dto/send-otp.dto';

export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>;
  getUserById(id: string): Promise<UserEntity>;
  findByPhone(email: string): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity>;
  login(existingUser: Readonly<ExistingUserDTO>): Promise<{
    token: string;
    user: UserEntity;
  }>;
  verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }>;
  getUserFromHeader(jwt: string): Promise<UserJwt>;
  sendOtp(sendOtpDto: SendOtpDto);
}
