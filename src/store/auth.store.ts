import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/api/auth.service";
import { showErrorToast, showSuccessToast } from "../services/ui/toasts";
import { storageService } from "../services/api/storage.service";
import { useUserStore } from "./user.store";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: any | null;
  loading: boolean;
  error: string | null;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  sendOTP: (phoneNumber: string) => Promise<boolean>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      phoneNumber: "",
      token: null,
      setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),

      sendOTP: async (phoneNumber: string) => {
        try {
          set({ loading: true, error: null });
          await authService.sendOTP({ phoneNumber });
          set({ loading: false });
          showSuccessToast("OTP Sent Successfully");
          return true;
        } catch (error: any) {
          showErrorToast(error.response?.data?.message || "Failed to Send OTP");
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to Send OTP",
          });
          return false;
        }
      },

      verifyOTP: async (phoneNumber: string, otp: string) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.verifyOTP({ phoneNumber, otp });
          if (response.data?.auth_token) {
            await storageService.setItem("token", response.data.auth_token);
          }
          set({
            loading: false,
            isAuthenticated: true,
            token: response.data?.auth_token,
          });
          showSuccessToast("user Logged In");
          await useUserStore.getState().fetchUser();
          return true;
        } catch (error: any) {
          showErrorToast(error.response?.data?.message || "Failed to verify OTP");
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to verify OTP",
          });
          return false;
        }
      },

      logout: async() => {
        set({
          isAuthenticated: false,
          user: null,
          error: null,
          phoneNumber: "",
          token: null,
        });
        await storageService.clear();
        useUserStore.getState().clearUser();
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
