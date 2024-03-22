import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  NotAcceptableException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UserEntity, UserJwt } from '@app/shared';

import { ExistingUserDTO } from './dtos/existing-user.dto';
import { AuthServiceInterface } from './interfaces/auth.service.interface';
import { CustomerRepositoryInterface } from '@app/shared/interfaces/customers.repository.interface';
import { SendOtpDto } from '@app/shared/dto/send-otp.dto';
import { SmsGatewayService } from '@app/shared/services/sms-gateway.service';
import { ValidateOtpDto } from '@app/shared/dto/validate-otp.dto';
import { RpcException } from '@nestjs/microservices';
import * as argon2 from 'argon2';
import { RefreshTokenDto } from '@app/shared/dto/refresh-token.dto';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('CustomersRepositoryInterface')
    private readonly customersRepository: CustomerRepositoryInterface,
    private readonly jwtService: JwtService,
    private readonly smsGatewayService: SmsGatewayService,
    private configService: ConfigService,
  ) {}

  async getUsers(): Promise<UserEntity[]> {
    return await this.customersRepository.findAll();
  }

  async getUserById(id: string): Promise<UserEntity> {
    return await this.customersRepository.findOneById(id);
  }

  async findByPhone(phone: string): Promise<UserEntity> {
    return this.customersRepository.findByCondition({
      where: { phone },
      select: ['id', 'fullName', 'email', 'phone', 'otp'],
    });
  }

  async findOneById(id: string): Promise<UserEntity> {
    return this.customersRepository.findByCondition({
      where: { id },
      select: ['id', 'fullName', 'email', 'phone', 'otp', 'refreshToken'],
    });
  }

  async findById(id: string): Promise<UserEntity> {
    return this.customersRepository.findOneById(id);
  }

  async login(existingUser: Readonly<ExistingUserDTO>) {
    const { email, password } = existingUser;
    const user = null; //await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({ user });

    return { token: jwt, user };
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  sendOtp = async (sendOtpDto: SendOtpDto) => {
    //fetch customer from DB
    const fetchedCustomer = await this.findByPhone(sendOtpDto.phone);
    console.log(fetchedCustomer);

    //check if customer exists
    if (fetchedCustomer) {
      const generatedOtpCode = crypto
        .randomInt(0, 9999)
        .toString()
        .padStart(4, '0');
      console.log('sent otp is: ', generatedOtpCode);
      fetchedCustomer.otp = generatedOtpCode;
      await this.customersRepository.save(fetchedCustomer);
      const sentSms = await this.smsGatewayService.sendMessage(
        sendOtpDto.phone,
        `Please use code ${generatedOtpCode} to login to your account`,
      );
      if (!(sentSms.data && sentSms.data.StatusId == 1))
        throw new NotAcceptableException('Cannot Send Otp Code');

      return {};
    } else {
      const generatedOtpCode = crypto
        .randomInt(0, 9999)
        .toString()
        .padStart(4, '0');
      console.log('sent otp is: ', generatedOtpCode);
      await this.customersRepository.save({
        otp: generatedOtpCode,
        phone: sendOtpDto.phone,
        phoneCountryCode: '+972',
      });
      const sentSms = await this.smsGatewayService.sendMessage(
        sendOtpDto.phone,
        `Please use code ${generatedOtpCode} to login to your account`,
      );
      if (!(sentSms.data && sentSms.data.StatusId == 1))
        throw new NotAcceptableException('Cannot Send Otp Code');

      return {};
    }
  };

  validateOtp = async (validateOtpDto: ValidateOtpDto) => {
    //fetch customer from DB
    const fetchedCustomer = await this.findByPhone(validateOtpDto.phone);
    console.log(fetchedCustomer);
    if (!fetchedCustomer)
      throw new RpcException(
        new NotAcceptableException('No customer with this phone number'),
      );

    if (fetchedCustomer.otp == null)
      throw new RpcException(
        new NotAcceptableException('Please request OTP code first'),
      );

    if (fetchedCustomer.otp != validateOtpDto.otp)
      throw new RpcException(new NotAcceptableException('Invalid Otp Code'));
    fetchedCustomer.otp = null;
    await this.customersRepository.save(fetchedCustomer);
    delete fetchedCustomer.otp;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          fetchedCustomer,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          fetchedCustomer,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    await this.updateRefreshToken(fetchedCustomer.id, refreshToken);

    return { accessToken, refreshToken, user: fetchedCustomer };
  };

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    const fetchedCustomer = await this.findOneById(userId);
    fetchedCustomer.refreshToken = hashedRefreshToken;
    await this.customersRepository.save(fetchedCustomer);
  }

  async logout(userId: string) {
    const fetchedCustomer = await this.findOneById(userId);
    fetchedCustomer.refreshToken = null;
    await this.customersRepository.save(fetchedCustomer);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const user = await this.findOneById(refreshTokenDto.id);
    if (!user || !user.refreshToken)
      throw new RpcException(new ForbiddenException('Access Denied'));

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshTokenDto.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    delete user.otp;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          user,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          user,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    await this.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }
}
