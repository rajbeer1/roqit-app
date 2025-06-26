import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { storageService } from "../services/api/storage.service";
import Header from "../components/ui/Header";
import { showErrorToast, showSuccessToast } from "../services/ui/toasts";
import { backendService } from "../services/api/backend.service";
import { useUserStore } from "../store/user.store";
import { CommonActions } from "@react-navigation/native";
import OrderDataModal from "../components/ui/OrderDataModal";
import PaymentProofModal from "../components/ui/PaymentProofModal";

const sides = [
  {
    key: "Front",
    label: "Front Side",
    desc: "Front View Of Vehicle",
    icon: require("../../assets/front.png"),
  },
  {
    key: "Right",
    label: "Right Side",
    desc: "Right View Of Vehicle",
    icon: require("../../assets/right.png"),
  },
  {
    key: "Left",
    label: "Left Side",
    desc: "Left View Of Vehicle",
    icon: require("../../assets/left.png"),
  },
  {
    key: "Back",
    label: "Back Side",
    desc: "Back View Of Vehicle",
    icon: require("../../assets/back.png"),
  },
];

const VehicleVerificationScreen = ({ navigation, route }: any) => {
  const [vehicle, setVehicle] = useState<any>(null);
  const [images, setImages] = useState<{ [key: string]: string | null }>({
    Front: null,
    FrontType: null,
    Right: null,
    RightType: null,
    Left: null,
    LeftType: null,
    Back: null,
    BackType: null,
  });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"checkin" | "checkout">("checkin");
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const { fetchUser, inProgressTrip } = useUserStore();

  useEffect(() => {
    (async () => {
      const v = await storageService.getItem("selectedVehicle");
      setVehicle(v);
      if (route?.params?.mode) setMode(route.params.mode);
    })();
  }, []);

  const pickImage = async (side: string) => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      showErrorToast("Camera permission is required to take photos");
      return;
    }
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0].base64) {
        setLoading(true);
        const base64 = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
        setImages((prev) => ({
          ...prev,
          [side]: base64 ?? null,
          [side + "Type"]: result.assets[0].mimeType ?? null,
        }));
        setLoading(false);
      }
    } catch (error) {
      showErrorToast("Error picking image");
    }
  };

  const canProceed = () => {
    if (!vehicle && !inProgressTrip) return false;
    if (vehicle?.usageType?.toLowerCase() === "cargo" && mode === "checkin") {
      return sides.every((s) => images[s.key]);
    }
    if (inProgressTrip?.vehicle?.usageType === "cargo" && mode === "checkout") {
      return sides.every((s) => images[s.key]);
    }
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) {
      showErrorToast("Please upload all images for cargo vehicles.");
      return;
    }
    if (mode === "checkin") {
      if (vehicle?.usageType?.toLowerCase() === "cargo") {
        setLoading(true);
        try {
          const address = await storageService.getItem("userAddress");
          const vehicleId = vehicle.id;
          const payload = {
            vehicleId,
            address,
            photo: images,
          };
          const res = await backendService.checkInForCargo(payload);
          await fetchUser();
          showSuccessToast("Check-in successful!");
          await storageService.removeItem("userAddress");
          await storageService.removeItem("selectedVehicle");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            })
          );
        } catch (err: any) {
          showErrorToast(err?.response?.data?.message || "Check-in failed");
        } finally {
          setLoading(false);
        }
      } else {
        setPaymentModalVisible(true);
      }
    } else {
      if (inProgressTrip?.vehicle?.usageType === "passenger") {
        setLoading(true);
        try {
          const address = await storageService.getItem("userAddress");
          const inProgressTripId = inProgressTrip?.id;
          const payload = {
            tripId: inProgressTripId,
            address,
            photo: images,
          };
          await backendService.checkOutForPassenger(payload);
          await fetchUser();
          showSuccessToast("Check-out successful!");
          await storageService.removeItem("userAddress");
          await storageService.removeItem("selectedVehicle");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            })
          );
        } catch (error) {
          console.log(error);
          showErrorToast("Check-out failed");
        } finally {
          setLoading(false);
        }
      } else {
        setOrderModalVisible(true);
      }
    }
  };

  const handleOrderDataConfirm = async (orders: any, paymentAmount: string) => {
    try {
      setLoading(true);
      try {
        const location = await storageService.getItem("userAddress");
        const inProgressTripId = inProgressTrip?.id;
        const payload = {
          tripId: inProgressTripId,
          address: location,
          photo: images,
          orders: orders,
          totalCash: paymentAmount,
        };
        await backendService.checkOutForCargo(payload);
        await fetchUser();
        showSuccessToast("Check-out successful!");
        await storageService.removeItem("userAddress");
        await storageService.removeItem("selectedVehicle");
        setOrderModalVisible(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          })
        );
      } catch (err: any) {
        showErrorToast(err?.response?.data?.message || "Check-out failed");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      showErrorToast("Failed to save order data");
    }
  };

  const handlePaymentProofConfirm = async (data: any) => {
    setLoading(true);
    try {
      const address = await storageService.getItem("userAddress");
      const payload = {
        vehicleId: vehicle.id,
        address,
        photo: images,
        paymentAmount: data.amount,
        paymentMode: data.paymentMode,
        paymentProof: data.proofImage,
        paymentProofType: data.proofType,
      };
      await backendService.checkInForPassenger(payload);
      await fetchUser();
      showSuccessToast("Check-in successful!");
      await storageService.removeItem("userAddress");
      await storageService.removeItem("selectedVehicle");
      setPaymentModalVisible(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        })
      );
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Click all 4 sides of vehicle for Verification
        </Text>
        <View style={styles.grid}>
          {sides.map((side) => (
            <View key={side.key} style={styles.cell}>
              {typeof images[side.key] === "string" && images[side.key] ? (
                <Image
                  source={{ uri: images[side.key] as string }}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity
                  style={[styles.card, images[side.key] && styles.cardSelected]}
                  onPress={() => pickImage(side.key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconWrap}>
                    <Image source={side.icon} style={styles.icon} />
                  </View>
                  <Text style={styles.cardLabel}>{side.label}</Text>
                  <Text style={styles.cardDesc}>{side.desc}</Text>
                  {images[side.key] && (
                    <Text style={styles.uploaded}>✓ Uploaded</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            { opacity: canProceed() && !loading ? 1 : 0.5 },
          ]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.buttonText}>
            {mode === "checkin"
              ? vehicle?.usageType === "cargo"
                ? loading
                  ? "Checking In..."
                  : "Check In"
                : "Next"
              : inProgressTrip?.vehicle?.usageType === "passenger"
              ? loading
                ? "Checking Out..."
                : "Check Out"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <OrderDataModal
        visible={orderModalVisible}
        onConfirm={handleOrderDataConfirm}
        onClose={() => setOrderModalVisible(false)}
        loading={loading}
      />
      <PaymentProofModal
        visible={paymentModalVisible}
        onConfirm={handlePaymentProofConfirm}
        onClose={() => setPaymentModalVisible(false)}
        loading={loading}
        defaultLicensePlate={vehicle?.licensePlate || ""}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 3,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 2,
  },
  uploaded: {
    color: "#00994C",
    fontWeight: "bold",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  infoText: {
    color: "#888",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#1877f2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    shadowColor: "#1877f2",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default VehicleVerificationScreen;
