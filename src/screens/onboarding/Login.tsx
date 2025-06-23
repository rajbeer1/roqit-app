import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RoqButton from "../../components/ui/RoqButton";
import KeyboardWrapper from "../../components/ui/Keyboard";
import { useAuthStore } from "../../store/auth.store";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [countryCode, setCountryCode] = useState("+91");
  const {
    sendOTP,
    loading,
    setPhoneNumber: setPhoneNumberStore,
    error,
  } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handlePhoneChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(cleanedText);
  };

  const handleCountryCodeChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    if (cleanedText.length <= 3) {
      setCountryCode("+" + cleanedText);
    }
  };

  const handleGetOtp = async () => {
    const FullPhoneNumber = countryCode + phoneNumber;
    setPhoneNumberStore(FullPhoneNumber);
    Keyboard.dismiss();
    const result = await sendOTP(FullPhoneNumber);
    if (result === true) {
      navigation.navigate("VerifyOtp", { phoneNumber: FullPhoneNumber });
    }
  };

  const isButtonDisabled =
    countryCode === "+91"
      ? phoneNumber.length !== 10
      : phoneNumber.length === 0;

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Text style={styles.heading}>Let's</Text>
        <Text style={styles.heading}>
          get <Text style={styles.blue}>Started</Text>
        </Text>
        <View style={{ height: 40 }} />
        <Text style={styles.label}>Phone number (10 digits without code)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.countryCodeInput}
            placeholder="+91"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={countryCode}
            onChangeText={handleCountryCodeChange}
            maxLength={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            maxLength={countryCode === "+91" ? 10 : 30}
          />
        </View>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <Text style={styles.loginText}>
          New to Roqit? <Text style={styles.loginLink}>Register</Text>
        </Text>
        <RoqButton
          title="Get OTP"
          iconName="cellphone"
          onPress={handleGetOtp}
          style={styles.button}
          disabled={isButtonDisabled || loading}
          loading={loading}
        />
      </View>
    </KeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
  },
  heading: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111",
    lineHeight: 40,
  },
  blue: {
    color: "#1565c0",
  },
  label: {
    fontSize: 12,
    color: "#222",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 30,
    paddingBottom: 5,
  },
  countryCodeInput: {
    width: 50,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  bottom: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  loginText: {
    fontSize: 16,
    color: "#222",
    marginBottom: 8,
  },
  loginLink: {
    color: "#1565c0",
    fontWeight: "600",
  },
  button: {
    width: "100%",
    marginTop: 8,
  },
});

export default Login;
