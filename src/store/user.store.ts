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
  trips: any[] | null;
  tripsUnder8Hours: any | null;
  fetchUser: () => Promise<void>;
  setUser: (user: UserType) => void;
  clearUser: () => void;
  stats: { loginTime: string; totalDistance: string; vehicles: string };
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
      trips: null,
      loading: false,
      error: null,
      stats: { loginTime: '', totalDistance: '', vehicles: '' },
      tripsUnder8Hours: null,
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
        const trips = user?.trips ?? null;
        let totalSeconds = 0;
        let totalDistance = 0;
        const vehicleSet = new Set<string>();
        for (const trip of trips) {
          if (trip.tripStartDate && trip.tripEndDate) {
            const start = new Date(trip.tripStartDate).getTime();
            const end = new Date(trip.tripEndDate).getTime();
            if (!isNaN(start) && !isNaN(end) && end > start) {
              totalSeconds += Math.floor((end - start) / 1000);
            }
          }
          if (typeof trip.distance === 'number') {
            totalDistance += trip.distance;
          }
          if (trip.vehicle && trip.vehicle.licensePlate) {
            vehicleSet.add(trip.vehicle.licensePlate);
          }
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const loginTime = `${hours} Hrs${minutes > 0 ? ' ' + minutes + ' Min' : ''}`;

        let tripsUnder8Hours = 0;
        
        for (const trip of trips) {
          if (trip.tripStartDate && trip.tripEndDate) {
            const start = new Date(trip.tripStartDate).getTime();
            const end = new Date(trip.tripEndDate).getTime();
            if (!isNaN(start) && !isNaN(end) && end > start) {
              const tripDurationHours = (end - start) / (1000 * 60 * 60); // Convert to hours
              if (tripDurationHours < 8) {
                tripsUnder8Hours++;
              }
            }
          }
        }

        set({
          user,
          operationLat,
          operationLng,
          inProgressTrip,
          organisationId,
          geofenceRadius,
          approvalStatus,
          trips,
          tripsUnder8Hours,
          stats: { loginTime, totalDistance: `${totalDistance}`, vehicles: `${vehicleSet.size}` },
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
        trips: null,
        tripsUnder8Hours: null,
        loading: false,
        error: null,
        stats: { loginTime: '', totalDistance: '', vehicles: '' },
      }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 