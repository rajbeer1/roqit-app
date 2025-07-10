import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import * as ImagePicker from "expo-image-picker";
import { useOnboardingStore } from "../../../store/onboarding.store";
import { showErrorToast, showSuccessToast } from "../../../services/ui/toasts";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import KeyboardWrapper from "../../../components/ui/Keyboard";
import { MaterialIcons } from "@expo/vector-icons";
import { backendService } from "../../../services/api/backend.service";
import { storageService } from "../../../services/api/storage.service";

type SixthRouteProp = RouteProp<RootStackParamList, "Sixth">;

interface DocumentItem {
  key: string;
  label: string;
  desc: string | ((source: string) => string);
  icon: any;
}

const documents: DocumentItem[] = [
  {
    key: "panCard",
    label: "PAN Card",
    desc: (source: string) =>
      source === "browse"
        ? "Select PAN Card from gallery"
        : "Upload your PAN Card",
    icon: require("../../../../assets/pan-card.png"),
  },
  {
    key: "drivingLicense",
    label: "Driving License",
    desc: (source: string) =>
      source === "browse"
        ? "Select Driving License from gallery"
        : "Upload your Driving License",
    icon: require("../../../../assets/driver-license.png"),
  },
  {
    key: "selfie",
    label: "Selfie",
    desc: "Take a clear selfie",
    icon: require("../../../../assets/camera.png"),
  },
];

const Sixth = ({ route }: { route: SixthRouteProp }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userInfo, setUserInfo } = useOnboardingStore();
  const insets = useSafeAreaInsets();
  const [images, setImages] = useState<{ [key: string]: string | null }>({
    panCard: userInfo?.documents?.panCard || null,
    panCardType: userInfo?.documents?.panCardType || null,
    drivingLicense: userInfo?.documents?.drivingLicense || null,
    drivingLicenseType: userInfo?.documents?.drivingLicenseType || null,
    selfie: userInfo?.documents?.selfie || null,
    selfieType: userInfo?.documents?.selfieType || null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (documentKey: string) => {
    try {
      let result;
      if (route.params?.source === "browse" && documentKey !== "selfie") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showErrorToast("Gallery permission is required to pick images");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.25,
          base64: true,
        });
      } else {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== "granted") {
          showErrorToast("Camera permission is required to take photos");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.25,
          base64: true,

          cameraType:
            documentKey === "selfie"
              ? ImagePicker.CameraType.front
              : ImagePicker.CameraType.back,
        });
      }

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64 = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
        setImages((prev) => ({
          ...prev,
          [documentKey]: base64 ?? null,
          [documentKey + "Type"]: result.assets[0].mimeType ?? null,
        }));
      }
    } catch (error) {
      showErrorToast("Error picking image");
    }
  };

  const canProceed = () => {
    const requiredDocs = ["panCard", "drivingLicense", "selfie"];
    const isAllDocumentsUploaded = requiredDocs.every((doc) => images[doc]);
    return isAllDocumentsUploaded;
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      showErrorToast(`Please upload all the documents`);
      return;
    }

    setIsSubmitting(true);

    try {
      const kyc = [];
      if (images.panCard) {
        kyc.push({
          documentType: images.panCardType || "image/jpeg",
          documentNumber: images.panCard,
        });
      }
      if (images.drivingLicense) {
        kyc.push({
          documentType: images.drivingLicenseType || "image/jpeg",
          documentNumber: images.drivingLicense,
        });
      }

      const registrationPayload = {
        firstName: userInfo?.firstName || "",
        lastName: userInfo?.lastName || "",
        driverCountry: userInfo?.driverCategory || userInfo?.country || "India",
        photoType: "image/jpeg",
        photo: images.selfie || "",
        phoneNumber: userInfo?.phoneNumber || "",
        gender: userInfo?.gender || "",
        email: userInfo?.email || "",
        dateOfBirth: userInfo?.dateOfBirth || "",
        dateOfJoining: userInfo?.dateOfJoining || "",
        license: {
          number: userInfo?.license?.number || "",
          issuedOn: userInfo?.license?.issuedOn || Date.now(),
          expiresOn: userInfo?.license?.expiresOn || "",
          category: userInfo?.license?.category || "",
        },
        permanentAddress: userInfo?.permanentAddress || "N/A",
        mailingAddress: userInfo?.mailingAddress || "N/A",
        emergencyContact: {
          name: userInfo?.emergencyContact?.name || "N/A",
          phoneNumber: userInfo?.emergencyContact?.phoneNumber || "",
          relationship: userInfo?.emergencyContact?.relationShip || "N/A",
        },
        kyc,
      };
      const hubCode = useOnboardingStore.getState().hubCode;

      if (!hubCode) {
        showErrorToast("Hub code is required for registration");
        return;
      }
      const response = await backendService.registerUser(
        registrationPayload,
        hubCode
      );
      console.log('response', response.data);


      if (response.data?.token) {
        storageService.setItem("token", response.data.token);
        setUserInfo({});
        showSuccessToast("Registration completed successfully!");
        navigation.navigate("MainTabs");
      } else {
        const errorResponse = response.data?.error;
        console.log('errorResponse', errorResponse);
        showErrorToast(
          errorResponse || "Registration failed. Please try again."
        );
      }
    } catch (error: any) {
      console.log('error', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequiredDocuments = () => {
    if (route.params?.source === "pan") {
      return documents.filter(
        (doc) => doc.key === "panCard" || doc.key === "selfie"
      );
    } else if (route.params?.source === "driving") {
      return documents.filter(
        (doc) => doc.key === "drivingLicense" || doc.key === "selfie"
      );
    }
    return documents;
  };

  const isButtonDisabled = !canProceed() || isSubmitting;

  return (
    <KeyboardWrapper style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Document Verification</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step 6/6</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "100%" }]} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Upload Required Documents</Text>
        <Text style={styles.description}>
          Please upload clear images of your documents and take a selfie. Make
          sure the details are visible and not blurred or cropped.
        </Text>

        <ScrollView
          style={[styles.cardContainer, { marginBottom: 100 }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.grid}>
            {getRequiredDocuments().map((doc) => (
              <View key={doc.key} style={styles.cell}>
                {typeof images[doc.key] === "string" && images[doc.key] ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: images[doc.key] as string }}
                      style={styles.uploadedImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.retakeButton}
                      onPress={() => pickImage(doc.key)}
                    >
                      <MaterialIcons name="camera-alt" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.card,
                      images[doc.key] && styles.cardSelected,
                    ]}
                    onPress={() => pickImage(doc.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconWrap}>
                      <Image source={doc.icon} style={styles.icon} />
                    </View>
                    <Text style={styles.cardLabel}>{doc.label}</Text>
                    <Text style={styles.cardDesc}>
                      {typeof doc.desc === "function"
                        ? doc.desc(route.params?.source || "camera")
                        : doc.desc}
                    </Text>
                    {images[doc.key] && (
                      <Text style={styles.uploaded}>✓ Uploaded</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={[styles.bottomFixed, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.saveButton, isButtonDisabled && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={isButtonDisabled}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? "Registering..." : "Complete Registration"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 30 : 24,
    paddingBottom: 8,
    backgroundColor: "#fff",
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  cardContainer: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  cell: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0eaff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0eaff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  retakeButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#1565c0",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderColor: "#1565c0",
    backgroundColor: "#eaf4ff",
  },
  iconWrap: {
    backgroundColor: "#eaf4ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 2,
  },
  uploaded: {
    color: "#00994C",
    fontWeight: "bold",
    marginTop: 4,
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

export default Sixth;
