import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Linking,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PhoneCircle } from "../icons/PhoneCircle";

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
  latitude?: string;
  longitude?: string;
}

interface DeliveryImage {
  url: string;
  key: string;
}

interface StopDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  task: TaskItem | null;
  deliveryImages: DeliveryImage[];
  realImages?: DeliveryImage[];
  onMarkComplete: () => void;
  showMarkComplete?: boolean;
}

const StopDetailsModal: React.FC<StopDetailsModalProps> = ({
  visible,
  onClose,
  task,
  deliveryImages,
  realImages = [],
  onMarkComplete,
  showMarkComplete = true,
}) => {
  const isPickup =
    task?.pointType === "start" || task?.pointType === "route_start";

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDirections = () => {
    if (!task) return;

    if (task.latitude && task.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.fullAddress)}`;
      Linking.openURL(url);
    }
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dragBar} />
          <Text style={styles.modalTitle}>
            {isPickup ? "Pickup Details" : "Drop Details"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Customer Info */}
            <View style={styles.customerInfoCard}>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoName}>
                  {task.customerName || "Customer"}
                </Text>
                {task.customerPhone && (
                  <TouchableOpacity
                    onPress={() => handleCall(task.customerPhone || "")}
                  >
                    <PhoneCircle size={24} color="#0659AC" />
                  </TouchableOpacity>
                )}
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

            {/* Item Pictures */}
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {showMarkComplete && (
              <TouchableOpacity
                style={styles.markCompleteButton}
                onPress={onMarkComplete}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={16}
                  color="#0873DE"
                />
                <Text style={styles.markCompleteText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.directionsButton,
                !showMarkComplete && styles.directionsButtonFull,
              ]}
              onPress={handleDirections}
            >
              <MaterialCommunityIcons
                name="navigation-variant"
                size={16}
                color="#fff"
              />
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: SCREEN_HEIGHT * 0.7,
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  markCompleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0873DE",
    backgroundColor: "transparent",
    gap: 8,
  },
  markCompleteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0873DE",
    letterSpacing: 0.5,
  },
  directionsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0873DE",
    gap: 8,
  },
  directionsButtonFull: {
    flex: 2,
  },
  directionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

export default StopDetailsModal;
