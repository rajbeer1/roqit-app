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
import { useNavigation,CommonActions } from "@react-navigation/native";
import KeyboardWrapper from "../../components/ui/Keyboard";
import RoqButton from "../../components/ui/RoqButton";
import { useOnboardingStore } from "../../store/onboarding.store";

const HUB_CODE_LENGTH = 6;

const HubCode = () => {
  const [code, setCode] = useState(Array(HUB_CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const navigation = useNavigation();
  const { setHubCode } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  const handleChange = (text: string, idx: number) => {
    if (!/^[a-zA-Z0-9]*$/.test(text)) return;
    const newCode = [...code];
    newCode[idx] = text.toUpperCase();
    setCode(newCode);
    if (text && idx < HUB_CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleBackspace = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (code[idx]) {
        const newCode = [...code];
        newCode[idx] = "";
        setCode(newCode);
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
        const newCode = [...code];
        newCode[idx - 1] = "";
        setCode(newCode);
      }
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setHubCode(code.join(""));
    setTimeout(() => {
      setLoading(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "First" }],
        })
      )
    }, 500);
  };

  const isButtonDisabled = code.some((c) => !c);

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Text style={styles.heading}>Enter</Text>
        <Text style={styles.heading}>
          HUB <Text style={styles.blue}>CODE</Text>
        </Text>
        <Text style={styles.subtext}>Hub Fleet Manager will Provide code</Text>
        <View style={styles.codeRow}>
          {code.map((char, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => {
                inputs.current[idx] = ref;
              }}
              style={styles.codeInput}
              value={char}
              onChangeText={(text) => handleChange(text.slice(-1), idx)}
              onKeyPress={(e) => handleBackspace(e, idx)}
              keyboardType="default"
              maxLength={1}
              autoFocus={idx === 0}
              textAlign="center"
              returnKeyType="next"
              autoCapitalize="characters"
            />
          ))}
        </View>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>        
        <RoqButton
          title={loading ? "Loading" : "Continue"}
          onPress={handleSubmit}
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
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  codeInput: {
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

export default HubCode; 