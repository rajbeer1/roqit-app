import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import KeyboardWrapper from "../../../components/ui/Keyboard";
import { useOnboardingStore } from "../../../store/onboarding.store";
import { MaterialIcons, Feather } from '@expo/vector-icons';
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";

const First = () => {
  const { userInfo, setUserInfo } = useOnboardingStore();
  const [firstName, setFirstName] = useState(userInfo?.firstName || "");
  const [lastName, setLastName] = useState(userInfo?.lastName || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const handleNext = async () => {
    Keyboard.dismiss();
    setUserInfo({
      ...userInfo,
      firstName,
      lastName,
      email,
    });
    navigation.navigate("Second");
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handlecross=()=>{
    navigation.dispatch(CommonActions.reset({index: 0, routes: [{ name: 'MainTabs' }]}))
    setUserInfo({
      firstName: "",
      lastName: "",
      email: "",
    })
  }

  const isButtonDisabled = !firstName.trim() || !lastName.trim() || !email.trim() || !isValidEmail(email);

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your identity</Text>
          <TouchableOpacity onPress={handlecross} style={styles.headerIconAbsolute}>
            <Feather name="x" size={26} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 1/6</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '16.66%' }]} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Name & Email</Text>
        <ScrollView
          style={[styles.card, { marginBottom: 100 }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputRow}>
            <MaterialIcons name="person-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="person-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="email" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </ScrollView>
      </View>
      <View style={[styles.bottomFixed, { paddingBottom: insets.bottom + 8 }]}>        
        <TouchableOpacity
          style={[styles.saveButton, isButtonDisabled && { opacity: 0.5 }]}
          onPress={handleNext}
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
  headerIconAbsolute: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 13,
    color: '#222',
    marginRight: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '20%',
    height: 6,
    backgroundColor: '#1565c0',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fafbfc',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
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
  bottom: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
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
});

export default First; 