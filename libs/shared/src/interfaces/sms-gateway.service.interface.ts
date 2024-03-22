export interface SmsGatewayServiceInterface {
  sendMessage(phone: string, message: string): any;
}
