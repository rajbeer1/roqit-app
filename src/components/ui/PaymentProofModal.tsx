import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import KeyboardWrapper from "./Keyboard";
import { showErrorToast } from "../../services/ui/toasts";

interface PaymentProofModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: {
    amount: string;
    paymentMode: "upi" | "cash" | null;
    proofImage: string | null;
    proofType: string | null;
  }) => void;
  loading?: boolean;
  defaultLicensePlate?: string;
}

const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  defaultLicensePlate = "",
}) => {
  const now = new Date();
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash" | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofType, setProofType] = useState<string | null>(null);

  const dateStr = now.toLocaleDateString("en-GB");
  const timeStr = now.toLocaleTimeString("en-GB");

  const pickImage = async (fromCamera: boolean) => {
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          showErrorToast("Camera permission is required to take photos");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.5,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showErrorToast("Gallery permission is required to pick images");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.5,
          base64: true,
        });
      }
      if (!result.canceled && result.assets && result.assets[0].base64) {
        setProofImage(
          `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`
        );
        setProofType(result.assets[0].mimeType ?? null);
      }
    } catch (error) {
      showErrorToast("Error picking image");
    }
  };

  const handleConfirm = () => {
    if ( !amount || !paymentMode) return;
    if (paymentMode === "upi" && !proofImage) return;
    onConfirm({
      amount,
      paymentMode,
      proofImage,
      proofType,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <KeyboardWrapper style={styles.modalContainer}>
          <View style={styles.dragBar} />
          <Text style={styles.title}>Payment Details</Text>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                License Plate Number<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={defaultLicensePlate}
                placeholderTextColor="#bbb"
                editable={!defaultLicensePlate}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={dateStr}
                  editable={false}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={timeStr}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Enter Amount<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="₹"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
              />
            </View>
            <Text style={[styles.label, { marginBottom: 6 }]}>
              Mode of Payment<Text style={styles.required}>*</Text>
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  paymentMode === "upi" && styles.modeButtonSelected,
                ]}
                onPress={() => setPaymentMode("upi")}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../../assets/upi.png")}
                  style={styles.modeIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  paymentMode === "cash" && styles.modeButtonSelected,
                ]}
                onPress={() => setPaymentMode("cash")}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../../assets/cash.png")}
                  style={styles.modeIcon}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { marginTop: 12 }]}>
              Upload Payment Proof {paymentMode === "upi" && <Text style={styles.required}>*</Text>}
            </Text>
            {proofImage ? (
              <Image source={{ uri: proofImage }} style={styles.proofPreview} />
            ) : (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage(false)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require("../../../assets/browse.png")}
                    style={styles.browseIcon}
                  />
                  <Text style={styles.uploadText}>Browse</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage(true)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require("../../../assets/camera.png")}
                    style={styles.browseIcon}
                  />
                  <Text style={styles.uploadText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
                !amount || !paymentMode || (paymentMode === "upi" && !proofImage) || loading
                ? { opacity: 0.5 }
                : {},
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={
               !amount || !paymentMode || (paymentMode === "upi" && !proofImage) || loading
            }
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <Text style={styles.cloudIcon}>☁️</Text>
              )}
              <Text style={styles.checkoutButtonText}>
                {loading ? "Processing..." : "Done"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={loading}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </KeyboardWrapper>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    height: "70%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "stretch",
    maxWidth: 420,
  },
  dragBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#222",
    marginBottom: 6,
  },
  required: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 12,
    backgroundColor: "#fafbfc",
    color: "#222",
  },
  inputCash: {
    fontSize: 12,
    paddingLeft: 16,
  },
  modeIcon: {
    width: 90,
    height: 50,
    resizeMode: "contain",
  },
  browseIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
  checkoutButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 2,
    shadowColor: "#1a73e8",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cloudIcon: {
    fontSize: 22,
    marginRight: 8,
    color: "#fff",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "center",
  },
  closeBtnText: {
    color: "#1565c0",
    fontWeight: "bold",
    fontSize: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0eaff",
    justifyContent: "center",
  },
  modeButtonSelected: {
    backgroundColor: "#eaf4ff",
    borderColor: "#1565c0",
  },
  modeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0eaff",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 10,
  },
  proofPreview: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    alignSelf: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e0eaff",
  },
});

export default PaymentProofModal;
