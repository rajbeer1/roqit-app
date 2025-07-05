import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import KeyboardWrapper from "../../../components/ui/Keyboard";
import { useOnboardingStore } from "../../../store/onboarding.store";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import { MaterialIcons } from '@expo/vector-icons';

const Third = () => {
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setUserInfo, userInfo } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  const country = userInfo.driverCategory || userInfo.country || "";

  const handleContinue = () => {
    const address = {
      addressLine1,
      addressLine2,
      city,
      state,
      zipcode,
      country,
    };
    const addressToSave = `${addressLine1}, ${addressLine2}, ${city}, ${state}, ${zipcode}, ${country}`;
    setUserInfo({
      ...userInfo,
      permanentAddress: addressToSave,
      mailingAddress: addressToSave,
    });
    navigation.navigate("Fourth");
  };

  const isButtonDisabled = !addressLine1.trim() || !city.trim() || !state.trim() || !zipcode.trim();

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Identity</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 3/5</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "60%" }]} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Permanent & Mailing Address</Text>
        <ScrollView
          style={[styles.card, { marginBottom: 100 }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputRow}>
            <MaterialIcons name="location-on" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              placeholderTextColor="#999"
              value={addressLine1}
              onChangeText={setAddressLine1}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="location-city" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Address Line 2"
              placeholderTextColor="#999"
              value={addressLine2}
              onChangeText={setAddressLine2}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="location-city" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#999"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="map" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor="#999"
              value={state}
              onChangeText={setState}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="markunread-mailbox" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Zipcode"
              placeholderTextColor="#999"
              value={zipcode}
              onChangeText={setZipcode}
              keyboardType="number-pad"
            />
          </View>
        </ScrollView>
      </View>
      <View style={[styles.bottomFixed, { paddingBottom: insets.bottom + 8 }]}>        
        <TouchableOpacity
          style={[styles.saveButton, isButtonDisabled && { opacity: 0.5 }]}
          onPress={handleContinue}
          disabled={isButtonDisabled}
        >
          <Text style={styles.saveButtonText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 30 : 24,
    paddingBottom: 8,
    backgroundColor: '#fff',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 13,
    color: "#222",
    marginRight: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#1565c0",
    borderRadius: 3,
    width: "60%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fafbfc",
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 12,
    color: "#222",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    fontSize: 16,
    color: "#333",
    paddingVertical:12,
    marginBottom: 4,
    width: "90%",
  },
  bottomFixed: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  saveButton: {
    width: "100%",
    backgroundColor: "#1565c0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
    paddingBottom: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
});

export default Third;