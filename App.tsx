import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { toastConfig } from "./src/services/ui/toasts";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from "./src/store/auth.store";
import { storageService } from "./src/services/api/storage.service";

export default function App() {
  // (async () => {
  //   const token = await storageService.removeItem('token');
  // })();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

