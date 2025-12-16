import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PhoneCircle } from "../icons/PhoneCircle";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { showErrorToast } from "../../services/ui/toasts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TaskItem {
  address: string;
  fullAddress: string;
  tripId: string;
  originalTripId?: string;
  pointType: "start" | "end" | "route_start" | "route_end";
  isCompleted: boolean;
  isCurrentStop: boolean;
  customerName?: string;
  customerPhone?: string;
  isRoutePoint?: boolean;
}

interface DeliveryImage {
  url: string;
  key: string;
}

interface CompleteStopModalProps {
  visible: boolean;
  onClose: () => void;
  task: TaskItem | null;
  routeId?: string;
  deliveryImages: DeliveryImage[];
  realImages?: DeliveryImage[];
  onSubmit: (data: {
    routeId: string;
    tripId: string;
    originalTripId?: string;
    pointType: string;
    otp: string;
    parcelImage?: string | null;
  }) => void;
}

const CompleteStopModal: React.FC<CompleteStopModalProps> = ({
  visible,
  onClose,
  task,
  routeId,
  deliveryImages,
  realImages = [],
  onSubmit,
}) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [parcelImage, setParcelImage] = useState<string | null>(null);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  const isPickup =
    task?.pointType === "start" || task?.pointType === "route_start";

  const handleClose = () => {
    setOtp(["", "", "", "", "", ""]);
    setParcelImage(null);
    onClose();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const pickParcelImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showErrorToast("Camera permission is required to take photos");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        const image = ImageManipulator.ImageManipulator.manipulate(
          result.assets[0].uri
        );
        image.resize({ width: 800 });
        const manipulatedImage = await image.renderAsync();
        const base64Result = await manipulatedImage.saveAsync({
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        });
        if (base64Result.base64) {
          setParcelImage(`data:image/jpeg;base64,${base64Result.base64}`);
        }
      }
    } catch (error) {
      showErrorToast("Error capturing image");
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const isButtonDisabled = !isOtpComplete || (isPickup && !parcelImage);

  const handleSubmit = () => {
    if (!task || isButtonDisabled) return;

    const otpValue = otp.join("");
    onSubmit({
      routeId: routeId || "",
      tripId: task.tripId,
      originalTripId: task.originalTripId,
      pointType: task.pointType,
      otp: otpValue,
      parcelImage: isPickup ? parcelImage : null,
    });

    handleClose();
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleClose}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContainer}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.dragBar} />
              <Text style={styles.modalTitle}>
                {isPickup ? "Pickup Item" : "Drop Item"}
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Customer Info */}
                <View style={styles.customerInfoCard}>
                  <View style={styles.customerInfoRow}>
                    <Text style={styles.customerInfoName}>
                      {task.customerName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCall(task.customerPhone || "")}
                    >
                      <PhoneCircle size={24} color="#0659AC" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.divider} />
                  <Text
                    style={styles.customerInfoAddress}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {task.fullAddress}
                  </Text>
                </View>

                {/* Item Pictures - Only for Pickup */}

                <View style={styles.itemPicturesSection}>
                  <Text style={styles.sectionTitle}>Item Pictures</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.itemPicturesScroll}
                  >
                    {deliveryImages.map((img, index) => (
                      <Image
                        key={img.key || index}
                        source={{ uri: img.url }}
                        style={styles.itemPicture}
                      />
                    ))}
                    {deliveryImages.length === 0 && (
                      <Text style={styles.noPicturesText}>
                        No item pictures available
                      </Text>
                    )}
                  </ScrollView>
                </View>

                {/* OTP Input */}
                <View style={styles.otpSection}>
                  <Text style={styles.sectionTitle}>
                    Enter confirmation OTP
                  </Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          otpInputRefs.current[index] = ref;
                        }}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>

                {/* Upload Parcel Picture - Only for Pickup */}
                {isPickup && (
                  <View style={styles.uploadSection}>
                    {parcelImage ? (
                      <TouchableOpacity
                        onPress={pickParcelImage}
                        style={styles.parcelImageContainer}
                      >
                        <Image
                          source={{ uri: parcelImage }}
                          style={styles.parcelImagePreview}
                        />
                        <View style={styles.changeImageOverlay}>
                          <Text style={styles.changeImageText}>
                            Tap to change
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadBox}
                        onPress={pickParcelImage}
                      >
                        <MaterialCommunityIcons
                          name="upload"
                          size={28}
                          color="#0873DE"
                        />
                        <Text style={styles.uploadTitle}>
                          Upload Parcel Picture
                        </Text>
                        <Text style={styles.uploadSubtitle}>
                          Make sure the parcel is clearly visible
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Real Images - Only for Drop (non-pickup) */}
                {!isPickup && realImages.length > 0 && (
                  <View style={styles.itemPicturesSection}>
                    <Text style={styles.sectionTitle}>Parcel Pictures</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.itemPicturesScroll}
                    >
                      {realImages.map((img, index) => (
                        <Image
                          key={img.key || index}
                          source={{ uri: img.url }}
                          style={styles.itemPicture}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </ScrollView>

              {/* Complete Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    isButtonDisabled && styles.completeButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isButtonDisabled}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  dragBar: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 16,
  },
  customerInfoCard: {
    backgroundColor: "#F6F8F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 16,
  },
  customerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customerInfoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 12,
  },
  customerInfoAddress: {
    fontSize: 14,
    color: "#8C8C8C",
    lineHeight: 20,
  },
  itemPicturesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    marginBottom: 10,
  },
  itemPicturesScroll: {
    flexDirection: "row",
  },
  itemPicture: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#E8E8E8",
  },
  noPicturesText: {
    fontSize: 12,
    color: "#8C8C8C",
    fontStyle: "italic",
  },
  otpSection: {
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    backgroundColor: "#fff",
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#0873DE",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F8F9",
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    marginTop: 8,
  },
  uploadSubtitle: {
    fontSize: 11,
    color: "#8C8C8C",
    marginTop: 2,
  },
  parcelImageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  parcelImagePreview: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  changeImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 6,
    alignItems: "center",
  },
  changeImageText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
  buttonContainer: {
    alignItems: "center",
    paddingTop: 8,
  },
  completeButton: {
    backgroundColor: "#0873DE",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    width: "60%",
  },
  completeButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default CompleteStopModal;
