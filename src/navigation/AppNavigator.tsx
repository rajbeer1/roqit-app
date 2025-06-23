import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/onboarding/Login';
import VerifyOtp from '../screens/onboarding/VerifyOtp';
import Home from '../screens/Home';
import { storageService } from '../services/api/storage.service';
import { View, ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  VerifyOtp: { phoneNumber: string };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await storageService.getItem('token');
      setInitialRoute(token ? 'Home' : 'Login');
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute as keyof RootStackParamList}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 