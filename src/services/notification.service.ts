import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { BackendApi } from "./api/config";
import { useUserStore } from "../store/user.store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  notificationId?: string;
  deeplink?: string;
  priority?: string;
  livefeed?: boolean;
  livefeedtitle?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;

    if (!Device.isDevice) {
      console.warn("Must use physical device for Push Notifications");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification!");
      return;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      await this.registerToken(token.data);
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  }

  async registerToken(token: string) {
    if (!this.userId) {
      console.warn("User ID not set, cannot register push token");
      return;
    }

    try {
      const deviceId = Device.osVersion || "unknown";
      const platform = Platform.OS === "ios" ? "ios" : "android";

      await BackendApi.post("/push-tokens/register", {
        userId: this.userId,
        token,
        deviceId,
        platform,
      });
    } catch (error) {
      console.error("Error registering push token:", error);
    }
  }

  async deregisterToken() {
    if (!this.expoPushToken) {
      return;
    }

    try {
      await BackendApi.delete(`/push-tokens/${this.expoPushToken}`);
    } catch (error) {
      console.error("Error deregistering push token:", error);
    }
  }

  setupNotificationListeners() {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as NotificationData;
        this.handleNotificationResponse(response, data);
      });

    return () => {
      responseListener.remove();
    };
  }

  private async handleNotificationResponse(
    response: Notifications.NotificationResponse,
    data: NotificationData
  ) {
    try {
      const { fetchUser } = useUserStore.getState();
      await fetchUser();
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error scheduling local notification:", error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error("Error getting badge count:", error);
      return 0;
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  }

  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
