import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { toastConfig } from "./src/services/ui/toasts";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useUserStore } from "./src/store/user.store";
import { useAuthStore } from "./src/store/auth.store";
import { storageService } from "./src/services/api/storage.service";
import { useOnboardingStore } from "./src/store/onboarding.store";

export default function App() {
  const { userInfo } = useOnboardingStore();
  console.log(userInfo);
// (async () => {
//   const token = await storageService.getItem('userAddress');
//   console.log(token);
// })();
// (async () => {
//   const token = await storageService.clear();

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

