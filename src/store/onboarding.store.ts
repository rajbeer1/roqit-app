import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/api/auth.service";
import { showErrorToast, showSuccessToast } from "../services/ui/toasts";
import { storageService } from "../services/api/storage.service";

interface OnboardingState {
  phoneNumber: string;
  loading: boolean;
  error: string | null;
  userInfo: any | null;
  isOnboardingComplete: boolean;
  hubCode?: string;

  setPhoneNumber: (phoneNumber: string) => void;
  setUserInfo: (userInfo: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  sendOnboardingOTP: (phoneNumber: string) => Promise<boolean>;
  verifyOnboardingOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHubCode: (hubCode: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      phoneNumber: "",
      loading: false,
      error: null,
      userInfo: null,
      isOnboardingComplete: false,
      hubCode: "",
      setPhoneNumber: (phoneNumber: string) => {
        set({ phoneNumber, error: null });
      },

      setUserInfo: (userInfo: any) => {
        set({ userInfo });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      sendOnboardingOTP: async (phoneNumber: string) => {
        try {
          set({ loading: true, error: null });
          await authService.sendOnboardingOTP({ phoneNumber });
          set({ phoneNumber, loading: false });

          showSuccessToast("OTP Sent Successfully");
          return true;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to Send OTP";
          showErrorToast(errorMessage);
          set({
            loading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      verifyOnboardingOTP: async (phoneNumber: string, otp: string) => {
        try {
          set({ loading: true, error: null });

          const response = await authService.verifyOnboardingOTP({
            phoneNumber,
            otp,
          });

          set({
            loading: false,
            phoneNumber,
          });

          showSuccessToast("OTP Verified Successfully");
          return true;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to verify OTP";
          showErrorToast(errorMessage);
          set({
            loading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      completeOnboarding: () => {
        set({ isOnboardingComplete: true });
      },

      resetOnboarding: async () => {
        set({
          phoneNumber: "",
          loading: false,
          error: null,
          userInfo: null,
          isOnboardingComplete: false,
          hubCode: "",
        });

        // Clear onboarding-related data from storage
        await storageService.removeItem("onboarding-token");
      },

      setHubCode: (hubCode: string) => {
        set({ hubCode });
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist specific fields
      partialize: (state) => ({
        phoneNumber: state.phoneNumber,
        userInfo: state.userInfo,
        isOnboardingComplete: state.isOnboardingComplete,
        hubCode: state.hubCode,
      }),
    }
  )
);
