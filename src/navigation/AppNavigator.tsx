import { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "../screens/onboarding/Login";
import VerifyOtp from "../screens/onboarding/VerifyOtp";
import HubCode from "../screens/onboarding/HubCode";
import Home from "../screens/Home";
import Trip from "../screens/Trip";
import Profile from "../screens/Profile";
import { storageService } from "../services/api/storage.service";
import { View, ActivityIndicator } from "react-native";
import CustomTabBar from "../components/ui/CustomTabBar";
import VehicleVerificationScreen from "../screens/VehicleVerificationScreen";
import First from "../screens/onboarding/userInfo/First";
import Second from "../screens/onboarding/userInfo/Second";
import Third from "../screens/onboarding/userInfo/Third";
import Fourth from "../screens/onboarding/userInfo/Fourth";
import Fifth from "../screens/onboarding/userInfo/Fifth";
import Sixth from "../screens/onboarding/userInfo/Sixth";
import ImageSelector from "../screens/onboarding/userInfo/ImageSelector";

export type RootStackParamList = {
  Login: undefined;
  VerifyOtp: { phoneNumber: string; isLogin: boolean };
  HubCode: undefined;
  First: undefined;
  Second: undefined;
  Third: undefined;
  Fourth: undefined;
  Fifth: undefined;
  Sixth: { source: string } | undefined;
  ImageSelector: undefined;
  MainTabs: undefined;
  VehicleVerification: undefined;
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
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: "#000",
      tabBarInactiveTintColor: "#888",
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
      const token = await storageService.getItem("token");
      setInitialRoute(token ? "MainTabs" : "Login");
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
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
      <Stack.Screen name="HubCode" component={HubCode} />
      <Stack.Screen name="First" component={First} />
      <Stack.Screen name="Second" component={Second} />
      <Stack.Screen name="Third" component={Third} />
      <Stack.Screen name="Fourth" component={Fourth} />
      <Stack.Screen name="Fifth" component={Fifth} />
      <Stack.Screen name="Sixth" component={Sixth} />
      <Stack.Screen name="ImageSelector" component={ImageSelector} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="VehicleVerification"
        component={VehicleVerificationScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
