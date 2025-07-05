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
import { MaterialIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import { useAuthStore } from "../../../store/auth.store";

const Fifth = () => {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [number, setNumber] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setUserInfo, userInfo } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    const { phoneNumber: driverPhoneNumber } = useAuthStore.getState();
    setUserInfo({
      ...userInfo,
      phoneNumber: driverPhoneNumber,
      emergencyContact: {
        name,
        relationShip: relation,
        phoneNumber: number,
      },
    });
    // navigation.navigate("MainTabs");
  };

  const isButtonDisabled = !name.trim() || !relation.trim() || !number.trim();

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
       <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Identity</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 5/5</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "100%" }]} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Emergency contact</Text>
        <ScrollView
          style={[styles.card, { marginBottom: 100 }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputRow}>
            <MaterialIcons name="person-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="person-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Relation"
              placeholderTextColor="#999"
              value={relation}
              onChangeText={setRelation}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="phone-android" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Emergency Number"
              placeholderTextColor="#999"
              value={number}
              onChangeText={setNumber}
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>
      </View>
      <View style={[styles.bottomFixed, { paddingBottom: insets.bottom + 8 }]}>        
        <TouchableOpacity
          style={[styles.saveButton, isButtonDisabled && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={isButtonDisabled}
        >
          <Text style={styles.saveButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 24,
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
    borderBottomWidth: 1,
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
  bottomFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
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
  },progressContainer: {
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
});

export default Fifth;