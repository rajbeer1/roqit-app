import { BackendApi } from "./config";
import { storageService } from "./storage.service";
export interface UserRegistrationRequest {
  firstName: string;
  lastName: string;
  driverCountry: string;
  photoType: string;
  photo: string;
  phoneNumber: string;
  gender: string;
  email: string;
  dateOfBirth: string;
  dateOfJoining: string;
  license: {
    number: string;
    issuedOn: number;
    expiresOn: string;
    category: string;
  };
  permanentAddress: string;
  mailingAddress: string;
  emergencyContact: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  kyc: Array<{
    documentType: string;
    documentNumber: string;
  }>;
}
export const backendService = {
  fetchUser: async () => {
    const response = await BackendApi.get("/user");
    return response.data;
  },
  fetchUserVehicles: async () => {
    const response = await BackendApi.get("/user/vehicles");
    return response.data;
  },
  checkInForCargo: async (payload: any) => {
    const response = await BackendApi.post("/user/trip/assign", payload);
    return response.data;
  },
  checkOutForCargo: async (payload: any) => {
    const response = await BackendApi.post("/user/trip/unassign", payload);
    return response.data;
  },
  checkInForPassenger: async (payload: any) => {
    const response = await BackendApi.post("/user/trip/assign", payload);
    return response.data;
  },
  checkOutForPassenger: async (payload: any) => {
    const response = await BackendApi.post("/user/trip/unassign", payload);
    return response.data;
  },
  registerUser: async (data: UserRegistrationRequest, hubCode: string) => {
    const response = await BackendApi.post(`/user/register?hubCode=${hubCode}`, data);
    return response.data;
  },
};

export const fetchDriverImage = async (
  organisationId: string,
  userId: string
) => {
  try {
    const token = await storageService.getItem("token");
    const response = await BackendApi.get(
      `/media/${organisationId}/Drivers/${userId}?photoField=photo`,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );
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
