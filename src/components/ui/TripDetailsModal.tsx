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

interface StopDetails {
  address: string;
  fullAddress: string;
  customerName?: string;
  customerPhone?: string;
  latitude?: string;
  longitude?: string;
  isCompleted: boolean;
  isCurrentStop: boolean;
  pointType: "start" | "end";
}

interface DeliveryImage {
  url: string;
  key: string;
}

interface TripDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  pickup: StopDetails | null;
  drop: StopDetails | null;
  deliveryImages: DeliveryImage[];
  realImages?: DeliveryImage[];
  onMarkComplete: (pointType: "start" | "end") => void;
  showPickupMarkComplete?: boolean;
  showDropMarkComplete?: boolean;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
  visible,
  onClose,
  tripId,
  pickup,
  drop,
  deliveryImages,
  realImages = [],
  onMarkComplete,
  showPickupMarkComplete = false,
  showDropMarkComplete = false,
}) => {
  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDirections = (stop: StopDetails | null) => {
    if (!stop) return;

    if (stop.latitude && stop.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.fullAddress)}`;
      Linking.openURL(url);
    }
  };

  const tripShortId = tripId?.slice(-4)?.toUpperCase() || "----";

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
          <Text style={styles.modalTitle}>T:{tripShortId}</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Pickup Details */}
            {pickup && (
              <>
                <Text style={styles.sectionLabel}>Pickup Details</Text>
                <View style={[styles.customerInfoCard, pickup.isCompleted && styles.completedCard]}>
                  <View style={styles.customerInfoRow}>
                    <Text style={styles.customerInfoName}>
                      {pickup.customerName || "Customer"}
                    </Text>
                    {pickup.customerPhone && (
                      <TouchableOpacity
                        onPress={() => handleCall(pickup.customerPhone || "")}
                      >
                        <PhoneCircle size={24} color="#0659AC" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.customerInfoAddressTitle} numberOfLines={1}>
                    {pickup.address}
                  </Text>
                  <Text
                    style={styles.customerInfoAddressSubtitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {pickup.fullAddress.split(",").slice(1).join(",").trim()}
                  </Text>
                  {pickup.isCompleted && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.completedBadge}>
                        <MaterialCommunityIcons name="check-circle-outline" size={16} color="#38AD51" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    </>
                  )}
                  {showPickupMarkComplete && !pickup.isCompleted && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.markCompleteButton}
                          onPress={() => onMarkComplete("start")}
                        >
                          <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={16}
                            color="#0873DE"
                          />
                          <Text style={styles.markCompleteText}>Mark Complete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.directionsButton}
                          onPress={() => handleDirections(pickup)}
                        >
                          <MaterialCommunityIcons
                            name="navigation-variant"
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.directionsText}>Directions</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}

            {/* Drop Details */}
            {drop && (
              <>
                <Text style={styles.sectionLabel}>Drop Details</Text>
                <View style={[styles.customerInfoCard, drop.isCompleted && styles.completedCard]}>
                  <View style={styles.customerInfoRow}>
                    <Text style={styles.customerInfoName}>
                      {drop.customerName || "Customer"}
                    </Text>
                    {drop.customerPhone && (
                      <TouchableOpacity
                        onPress={() => handleCall(drop.customerPhone || "")}
                      >
                        <PhoneCircle size={24} color="#0659AC" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.customerInfoAddressTitle} numberOfLines={1}>
                    {drop.address}
                  </Text>
                  <Text
                    style={styles.customerInfoAddressSubtitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {drop.fullAddress.split(",").slice(1).join(",").trim()}
                  </Text>
                  {drop.isCompleted && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.completedBadge}>
                        <MaterialCommunityIcons name="check-circle-outline" size={16} color="#38AD51" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    </>
                  )}
                  {showDropMarkComplete && !drop.isCompleted && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.markCompleteButton}
                          onPress={() => onMarkComplete("end")}
                        >
                          <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={16}
                            color="#0873DE"
                          />
                          <Text style={styles.markCompleteText}>Mark Complete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.directionsButton}
                          onPress={() => handleDirections(drop)}
                        >
                          <MaterialCommunityIcons
                            name="navigation-variant"
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.directionsText}>Directions</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}

            {/* Item Pictures */}
            <Text style={styles.sectionLabel}>Item Pictures</Text>
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

            {/* Real Images */}
            {realImages.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Parcel Pictures</Text>
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
              </>
            )}
          </ScrollView>
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
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#8C8C8C",
    marginBottom: 8,
  },
  customerInfoCard: {
    backgroundColor: "#F6F8F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 16,
  },
  completedCard: {
    borderColor: "#C5ECCD",
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
  customerInfoAddressTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    lineHeight: 20,
  },
  customerInfoAddressSubtitle: {
    fontSize: 12,
    color: "#8C8C8C",
    lineHeight: 16,
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  completedText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#38AD51",
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
  },
  markCompleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0873DE",
    backgroundColor: "transparent",
    gap: 6,
  },
  markCompleteText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0873DE",
  },
  directionsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0873DE",
    gap: 6,
  },
  directionsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TripDetailsModal;
