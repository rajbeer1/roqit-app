import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { backendService } from "../services/api/backend.service";
import { showErrorToast } from "../services/ui/toasts";

export interface UserType {
  [key: string]: any;
}

interface UserStoreState {
  user: UserType | null;
  operationLat: number | null;
  operationLng: number | null;
  inProgressTrip: any | null;
  organisationId: string | null;
  loading: boolean;
  geofenceRadius: number | null;
  error: string | null;
  approvalStatus: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: UserType) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      operationLat: null,
      operationLng: null,
      inProgressTrip: null,
      organisationId: null,
      geofenceRadius:null,
      approvalStatus: null,
      loading: false,
      error: null,
      fetchUser: async () => {
        try {
          set({ loading: true, error: null });
          const user = await backendService.fetchUser();
          get().setUser(user);
          set({ loading: false });
        } catch (error: any) {
          showErrorToast(error.response?.data?.message || "Failed to fetch user");
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to fetch user",
          });
        }
      },
      setUser: (user: UserType) => {
        const operationLat = user?.operation?.latitude ?? null;
        const operationLng = user?.operation?.longitude ?? null;
        const geofenceRadius = user?.operation?.geofenceRadius ?? null;
        const organisationId = user?.organisationId ?? null;
        const inProgressTrip = Array.isArray(user?.trips)
          ? user.trips.find((trip: any) => trip.status !== "Complete")
          : null;
        const approvalStatus = user?.approvalStatus ?? null;
        set({
          user,
          operationLat,
          operationLng,
          inProgressTrip,
          organisationId,
          geofenceRadius,
          approvalStatus
        });
      },
      clearUser: () => set({
        user: null,
        operationLat: null,
        operationLng: null,
        inProgressTrip: null,
        organisationId: null,
        geofenceRadius:null,
        approvalStatus: null,
        loading: false,
        error: null,
      }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 