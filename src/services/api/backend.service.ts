import { BackendApi } from "./config";
import { storageService } from "./storage.service";

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
