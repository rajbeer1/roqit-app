import { IdentityApi } from "./config";
import { storageService } from "./storage.service";

export interface SendOTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface SendOnboardingOTPRequest {
  phoneNumber: string;
}
export interface VerifyOnboardingOTPRequest {
  phoneNumber: string;
  otp: string;
}

export const authService = {
  sendOTP: (data: SendOTPRequest) => IdentityApi.post("/auth/otp/send", data),

  verifyOTP: (data: VerifyOTPRequest) =>
    IdentityApi.post("/auth/otp/verify", data),
  sendOnboardingOTP: (data: SendOnboardingOTPRequest) =>
    IdentityApi.post("/auth/otp/onboard/send", data),
  verifyOnboardingOTP: (data: VerifyOnboardingOTPRequest) =>
    IdentityApi.post("/auth/otp/onboard/verify", data),
};

export const fetchOrganisationLogo = async (organisationId: string) => {
  try {
    const token = await storageService.getItem("token");
    const response = await IdentityApi.get(`/media/org/${organisationId}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    const reader = new FileReader();
    reader.readAsDataURL(response.data);
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  } catch (error: any) {
    //
  }
};
