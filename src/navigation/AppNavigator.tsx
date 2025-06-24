import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from '../screens/onboarding/Login';
import VerifyOtp from '../screens/onboarding/VerifyOtp';
import Home from '../screens/Home';
import Trip from '../screens/Trip';
import Profile from '../screens/Profile';
import { storageService } from '../services/api/storage.service';
import { View, ActivityIndicator } from 'react-native';
import CustomTabBar from '../components/ui/CustomTabBar';

export type RootStackParamList = {
  Login: undefined;
  VerifyOtp: { phoneNumber: string };
  MainTabs: undefined;
};

export type TabParamList = {
  Home: undefined;
  Trip: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#888',
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Trip" component={Trip} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await storageService.getItem('token');
      setInitialRoute(token ? 'MainTabs' : 'Login');
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
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 