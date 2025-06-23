import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import RoqButton from "../../components/ui/RoqButton";
import KeyboardWrapper from "../../components/ui/Keyboard";
import { useAuthStore } from "../../store/auth.store";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { verifyOTP, loading, phoneNumber, sendOTP } = useAuthStore();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, idx: number) => {
    if (!/^[0-9]*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleBackspace = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    Keyboard.dismiss();
    const result = await verifyOTP(phoneNumber, code);
    if (result === true) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    }
  };
  const handleResendOTP = async () => {
    await sendOTP(phoneNumber);
    Keyboard.dismiss();
  };
  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>{"<-"}</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Verify</Text>
        <Text style={styles.heading}>
          using <Text style={styles.blue}>OTP</Text>
        </Text>
        <Text style={styles.subtext}>
          6-digit verification code 
        </Text>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => {
                inputs.current[idx] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text.slice(-1), idx)}
              onKeyPress={(e) => handleBackspace(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={idx === 0}
              textAlign="center"
              returnKeyType="next"
            />
          ))}
        </View>
        <TouchableOpacity style={styles.resendBtn} onPress={handleResendOTP}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <RoqButton
          title={loading ? "Loading" : "Verify"}
          iconName="cellphone"
          onPress={handleVerify}
          style={styles.button}
          disabled={otp.some((d) => !d) || loading}
          loading={loading}
        />
      </View>
    </KeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 12,
    zIndex: 2,
  },
  backArrow: {
    fontSize: 28,
    color: "#222",
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
    lineHeight: 38,
    marginTop: 16,
  },
  blue: {
    color: "#1565c0",
  },
  subtext: {
    fontSize: 15,
    color: "#222",
    marginTop: 24,
    marginBottom: 24,
  },
  bold: {
    fontWeight: "600",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 8,
    fontSize: 28,
    color: "#222",
    marginHorizontal: 6,
    backgroundColor: "#f7f7f7",
  },
  resendBtn: {
    alignSelf: "flex-end",
    marginRight: 8,
    marginBottom: 8,
  },
  resendText: {
    color: "#1565c0",
    fontWeight: "600",
    fontSize: 15,
  },
  bottom: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  button: {
    width: "100%",
    marginTop: 8,
  },
});

export default VerifyOtp;
