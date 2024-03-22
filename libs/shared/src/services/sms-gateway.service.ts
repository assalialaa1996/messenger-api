import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsGatewayServiceInterface } from '../interfaces/sms-gateway.service.interface';
import axios from 'axios';
@Injectable()
export class SmsGatewayService implements SmsGatewayServiceInterface {
  token!: string;
  senderName!: string;
  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get('INFOR_SMS_TOKEN');
    this.senderName = this.configService.get('INFOR_SMS_SENDER');
  }
  async sendMessage(phone: string, message: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic TWFzaGVEZWxpdmVyeTo2ZDRiY2U5ZS1kMDA5LTRmNDYtYmJiNC01NzRkZWEwZjNlZDU=',
      },
    };
    return axios.post<any>(
      `https://capi.inforu.co.il/api/v2/SMS/SendSms`,
      {
        Data: {
          Message: message,
          Recipients: [
            {
              Phone: phone,
            },
          ],
          Settings: {
            Sender: this.senderName,
          },
        },
      },
      config,
    );
  }
}
