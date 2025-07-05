import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import KeyboardWrapper from "../../../components/ui/Keyboard";
import { useOnboardingStore } from "../../../store/onboarding.store";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

const licenseCategory = {
  India: ["LMV", "LMV - TR", "HMV", "HTV", "TRANS", "TRAILR", "ERIKSH"],
  Germany: ["B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE"],
  Austria: ["B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE"],
  USA: ["Class A", "Class B", "Class C"],
  "Saudi Arabia": ["Heavy Vehicle"],
};

const genderOptions = ["male", "female", "others"];

const Second = () => {
  const [country, setCountry] = useState("India");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [dob, setDob] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [doj, setDoj] = useState<Date | null>(null);
  const [showDojPicker, setShowDojPicker] = useState(false);
  const [gender, setGender] = useState("male");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setUserInfo, userInfo } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleContinue = () => {
    setUserInfo({
      ...userInfo,
      driverCategory: country,
      dateOfBirth: dob ? dob.toISOString().split("T")[0] : "",
      dateOfJoining: doj ? doj.toISOString().split("T")[0] : "",
      gender,
    });
    navigation.navigate("Third");
  };

  const isButtonDisabled = !country || !dob || !doj || !gender;

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your identity</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 2/5</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "40%" }]} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Country, DOB, DOJ, Gender</Text>
        <ScrollView
          style={[styles.card, { marginBottom: 100 }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Country Dropdown */}
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.dropdownText}>{country}</Text>
            <Feather name="chevron-down" size={20} color="#888" />
          </TouchableOpacity>
          <Modal visible={showCountryModal} transparent animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowCountryModal(false)}
            >
              <View style={styles.modalContent}>
                {Object.keys(licenseCategory).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalItem}
                    onPress={() => {
                      setCountry(c);
                      setShowCountryModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>
          {/* DOB and DOJ in a row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Date of Birth</Text>

              {showDobPicker ? (
                <DateTimePicker
                  value={dob || new Date(1990, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "compact" : "default"}
                  onChange={(_: any, selectedDate?: Date) => {
                    setShowDobPicker(false);
                    if (selectedDate) setDob(selectedDate);
                  }}
                  maximumDate={new Date()}
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setTimeout(() => setShowDobPicker(true), 0)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{formatDate(dob)}</Text>
                  <Feather name="calendar" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Date of Joining</Text>

              {showDojPicker ? (
                <DateTimePicker
                  value={doj || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "compact" : "default"}
                  onChange={(_: any, selectedDate?: Date) => {
                    setShowDojPicker(false);
                    if (selectedDate) setDoj(selectedDate);
                  }}
                  maximumDate={new Date()}
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setTimeout(() => setShowDojPicker(true), 0)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{formatDate(doj)}</Text>
                  <Feather name="calendar" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioRow}>
            {genderOptions.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.radioBtn,
                  gender === g && styles.radioBtnSelected,
                ]}
                onPress={() => setGender(g)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    gender === g && styles.radioCircleSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.radioText,
                    gender === g && styles.radioTextSelected,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
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
    width: "40%",
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
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    width: 250,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalItemText: {
    fontSize: 16,
    color: "#222",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  radioRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
  },
  radioBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  radioBtnSelected: {
    borderColor: "#1565c0",
    backgroundColor: "#e3f0fd",
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#888",
    marginRight: 6,
    backgroundColor: "#fff",
  },
  radioCircleSelected: {
    borderColor: "#1565c0",
    backgroundColor: "#1565c0",
  },
  radioText: {
    fontSize: 15,
    color: "#222",
  },
  radioTextSelected: {
    color: "#1565c0",
    fontWeight: "600",
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
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
});

export default Second;
