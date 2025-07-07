import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import KeyboardWrapper from "../../../components/ui/Keyboard";
import { useOnboardingStore } from "../../../store/onboarding.store";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons, Feather } from '@expo/vector-icons';

const licenseCategory = {
  India: ["LMV", "LMV - TR", "HMV", "HTV", "TRANS", "TRAILR", "ERIKSH"],
  Germany: ["B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE"],
  Austria: ["B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE"],
  USA: ["Class A", "Class B", "Class C"],
  "Saudi Arabia": ["Heavy Vehicle"],
};

const Fourth = () => {
  const { userInfo, setUserInfo } = useOnboardingStore();
  const [licenseNumber, setLicenseNumber] = useState(userInfo?.license?.number || "");
  const [category, setCategory] = useState(userInfo?.license?.category || "");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [expiry, setExpiry] = useState<Date | null>(userInfo?.license?.expiresOn ? new Date(userInfo.license.expiresOn) : null);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  // Get country from userInfo
  const country = (userInfo?.driverCategory || userInfo?.country || "India") as keyof typeof licenseCategory;
  const categories = licenseCategory[country] || [];

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
      license: {
        number: licenseNumber,
        issuedOn: userInfo?.license?.issuedOn || Date.now(),
        expiresOn: expiry ? expiry.toISOString().split("T")[0] : "",
        category,
      },
    });
    navigation.navigate("Fifth");
  };

  const isButtonDisabled = !licenseNumber.trim() || !category || !expiry;

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Identity</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 4/6</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "66%" }]} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>License Details</Text>
        <ScrollView
          style={[styles.card, { marginBottom: 100 }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputRow}>
            <MaterialIcons name="credit-card" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="License Number"
              placeholderTextColor="#999"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="category" size={22} color="#888" style={styles.inputIcon} />
            <TouchableOpacity
              style={[styles.dropdown, { flex: 1 }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.dropdownText}>{category || "Select Category"}</Text>
              <Feather name="chevron-down" size={20} color="#888" />
            </TouchableOpacity>
            <Modal visible={showCategoryModal} transparent animationType="fade">
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowCategoryModal(false)}
              >
                <View style={styles.modalContent}>
                  {categories.map((cat: string) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.modalItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="event" size={22} color="#888" style={styles.inputIcon} />
            {showExpiryPicker ? (
              <DateTimePicker
                value={expiry || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "compact" : "default"}
                onChange={(_: any, selectedDate?: Date) => {
                  setShowExpiryPicker(false);
                  if (selectedDate) setExpiry(selectedDate);
                }}
                minimumDate={new Date()}
                maximumDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() + 100)
                  )
                }
              />
            ) : (
              <TouchableOpacity
                style={[styles.dateInput, { flex: 1 }]}
                onPress={() => setTimeout(() => setShowExpiryPicker(true), 0)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{formatDate(expiry)}</Text>
                <Feather name="calendar" size={20} color="#888" />
              </TouchableOpacity>
            )}
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
    width: "80%",
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
    paddingBottom: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#222',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
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
});

export default Fourth;