import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { backendService } from "../../services/api/backend.service";
import { VehicleIcon } from "../icons/VehicleIcon";
import { LicensePlateIcon } from "../icons/LicensePlate";
import { BatteryChargeIcon } from "../icons/BatteryCharge";
import { storageService } from "../../services/api/storage.service";

interface Vehicle {
  id: string;
  usageType?: string;
  type?: string;
  licensePlate?: string;
  registration?: { trNumber?: string };
  battery?: { percent?: number };
  photos?: { front?: string };
  location?: Record<string, any>;
}

interface VehicleSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onVehicleSelected: (vehicle: Vehicle) => void;
}

const VehicleSelectorModal: React.FC<VehicleSelectorModalProps> = (
  props: VehicleSelectorModalProps
) => {
  const { visible, onClose, onVehicleSelected } = props;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"passenger" | "cargo">("passenger");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setLoading(true);
      backendService
        .fetchUserVehicles()
        .then((data) => setVehicles(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const filteredVehicles = vehicles.filter((v) => {
    const typeMatch =
      filter === "passenger"
        ? v.usageType?.toLowerCase() === "passenger" ||
          v.type?.toLowerCase() === "passenger"
        : v.usageType?.toLowerCase() === "cargo" ||
          v.type?.toLowerCase() === "cargo";
    const plate = v.licensePlate || v.registration?.trNumber || "";
    const searchMatch = plate.toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });

  const handleGetVehicle = async (vehicle: Vehicle) => {
    await storageService.setItem("selectedVehicle", vehicle);
    onVehicleSelected(vehicle);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.filterTabs}>
            {/* <TouchableOpacity
              style={[styles.tab, filter === "passenger" && styles.tabActive]}
              onPress={() => setFilter("passenger")}
            >
              <Text
                style={[
                  styles.tabText,
                  filter === "passenger" && styles.tabTextActive,
                ]}
              >
                Passenger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, filter === "cargo" && styles.tabActive]}
              onPress={() => setFilter("cargo")}
            >
              <Text
                style={[
                  styles.tabText,
                  filter === "cargo" && styles.tabTextActive,
                ]}
              >
                Cargo
              </Text>
            </TouchableOpacity> */}
          </View>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search License Plate"
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#1565c0"
              style={{ marginTop: 32 }}
            />
          ) : (
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.vehicleCard}>
                  <View style={styles.vehicleInfoLeft}>
                    <View style={styles.availablePill}>
                      <Text style={styles.availablePillText}>Available</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <VehicleIcon />
                      <View style={styles.infoTextBlock}>
                        <Text style={styles.infoLabel}>Usage Type</Text>
                        <Text style={styles.infoValue}>
                          {item.usageType || item.type}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <LicensePlateIcon />
                      <View style={styles.infoTextBlock}>
                        <Text style={styles.infoLabel}>License Plate</Text>
                        <Text style={styles.infoValue}>
                          {item.licensePlate || item.registration?.trNumber}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <BatteryChargeIcon />
                      <View style={styles.infoTextBlock}>
                        <Text style={styles.infoLabel}>Battery Charge</Text>
                        <Text style={styles.infoValue}>
                          {item?.location?.soc
                            ? item?.location?.soc + "%"
                            : "--"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.vehicleInfoRight}>
                    <TouchableOpacity
                      onPress={() => handleGetVehicle(item)}
                      style={styles.getButton}
                    >
                      <Text style={styles.getButtonText}>Get Vehicle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🚫</Text>
                  <Text style={styles.emptyText}>Vehicle Not Available</Text>
                </View>
              }
              style={{ marginBottom: 8 }}
            />
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#f6f8f9",
    borderRadius: 24,
    padding: 18,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#f1f5fa",
    borderRadius: 24,
    alignSelf: "center",
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#eaf4ff",
  },
  tabText: {
    fontWeight: "600",
    color: "#222",
    fontSize: 18,
  },
  tabTextActive: {
    color: "#1565c0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 18,
    marginBottom: 18,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: "#222",
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleInfoLeft: {
    flex: 1,
    justifyContent: "center",
  },
  vehicleInfoRight: {
    justifyContent: "center",
    alignItems: "center",
    flex: 0.8,
  },
  availablePill: {
    backgroundColor: "#baf5d3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  availablePillText: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  infoTextBlock: {
    flexDirection: "column",
    marginLeft: 10,
  },
  infoLabel: {
    color: "#1565c0",
    fontWeight: "600",
    fontSize: 13,
  },
  infoValue: {
    color: "#222",
    fontSize: 16,
    fontWeight: "500",
  },
  getButton: {
    backgroundColor: "#1877f2",
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    alignSelf: "flex-end",
    shadowColor: "#1877f2",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  getButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  emptyIcon: {
    fontSize: 90,
    color: "#F44336",
    marginBottom: 16,
  },
  emptyText: {
    color: "#888792",
    fontSize: 28,
    fontWeight: "500",
    textAlign: "center",
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
  iconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
  },
});

export default VehicleSelectorModal;
