import { IdentityApi } from './config';

export interface SendOTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export const authService = {
  sendOTP: (data: SendOTPRequest) => 
    IdentityApi.post('/auth/otp/send', data),
  
  verifyOTP: (data: VerifyOTPRequest) =>
    IdentityApi.post('/auth/otp/verify', data),
}; 