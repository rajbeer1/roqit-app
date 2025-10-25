import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  CommonActions,
  NavigationProp,
} from "@react-navigation/native";
import { storageService } from "../services/api/storage.service";
import { backendService } from "../services/api/backend.service";
import Header from "../components/ui/Header";
import { useUserStore } from "../store/user.store";
// @ts-ignore
import RNSwipeButton from "rn-swipe-button";
import VehicleSelectorModal from "../components/ui/VehicleSelectorModal";
import * as Location from "expo-location";
import type { RootStackParamList } from "../navigation/AppNavigator";

const SWIPE_WIDTH = Math.round(Dimensions.get("window").width * 0.7);

const Home = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { fetchUser, inProgressTrip, reservedVehicle, user, loading } =
    useUserStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [geoErrorModal, setGeoErrorModal] = useState(false);
  const [geoErrorMsg, setGeoErrorMsg] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [driverCheckInLoading, setDriverCheckInLoading] = useState(false);
  const [driverCheckOutLoading, setDriverCheckOutLoading] = useState(false);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  let timerDisplay = "00:00:00";
  if (inProgressTrip && inProgressTrip.tripStartDate) {
    const startDateStr = inProgressTrip.tripStartDate;
    const startDate = startDateStr ? new Date(startDateStr) : null;
    if (startDate) {
      const diffSec = Math.floor(
        (currentTime.getTime() - startDate.getTime()) / 1000
      );
      timerDisplay = formatTime(diffSec > 0 ? diffSec : 0);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const token = await storageService.getItem("token");
      if (!token) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
      } else {
        fetchUser();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const inGeofence = await checkGeofence("checkin");
      if (inGeofence === true) {
        setModalVisible(true);
      } else {
        setGeoErrorModal(true);
      }
    } finally {
      setCheckInLoading(false);
    }
  };
  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      const inGeofence = await checkGeofence("checkout");
      if (inGeofence === true) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: "VehicleVerification", params: { mode: "checkout" } },
            ],
          })
        );
      } else {
        setGeoErrorModal(true);
      }
    } finally {
      setCheckOutLoading(false);
    }
  };

  const handleDriverCheckIn = async () => {
    setDriverCheckInLoading(true);
    try {
      const inGeofence = await checkGeofence("checkin");
      if (inGeofence === true) {
        await backendService.drivercheckin();
        await fetchUser();
      } else {
        setGeoErrorModal(true);
      }
    } catch (error) {
      console.error("Driver check-in error:", error);
    } finally {
      setDriverCheckInLoading(false);
    }
  };

  const handleDriverCheckOut = async () => {
    setDriverCheckOutLoading(true);
    try {
      const inGeofence = await checkGeofence("checkout");
      if (inGeofence === true) {
        await backendService.drivercheckout();
        await fetchUser();
      } else {
        setGeoErrorModal(true);
      }
    } catch (error) {
      console.error("Driver check-out error:", error);
    } finally {
      setDriverCheckOutLoading(false);
    }
  };
  const handleVehicleSelect = (vehicle: any) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "VehicleVerification" }],
      })
    );
    setModalVisible(false);
  };

  function getDistanceFromLatLonInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    function deg2rad(deg: number) {
      return deg * (Math.PI / 180);
    }
    const R = 6371000;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (result && result[0]) {
        const address = result[0];
        return `${address.street || ""} ${address.city || ""} ${
          address.region || ""
        } ${address.country || ""}`.trim();
      }
      return "Address not found";
    } catch (error) {
      return "Malout";
    }
  };

  const checkGeofence = async (type: "checkin" | "checkout") => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGeoErrorMsg(
        "Location permission denied. Please enable location to continue."
      );
      return false;
    }
    let loc;
    try {
      loc = await Location.getCurrentPositionAsync({});
      const addressText = await getAddressFromCoords(
        loc.coords.latitude,
        loc.coords.longitude
      );
      const addressObj = {
        latitude: String(loc.coords.latitude),
        longitude: String(loc.coords.longitude),
        address: addressText,
      };
      await storageService.setItem("userAddress", addressObj);
    } catch (e) {
      setGeoErrorMsg("Could not get your location. Please try again.");
      return false;
    }
    const { operationLat, operationLng, geofenceRadius } =
      useUserStore.getState();
    if (
      operationLat == null ||
      operationLng == null ||
      geofenceRadius == null
    ) {
      setGeoErrorMsg("Operation hub location or geofence not set.");
      return false;
    }
    const dist = getDistanceFromLatLonInMeters(
      loc.coords.latitude,
      loc.coords.longitude,
      operationLat,
      operationLng
    );
    if (dist <= geofenceRadius * 1000) {
      setGeoErrorMsg("");
      return true;
    } else {
      setGeoErrorMsg(
        `You are not in the operation HUB to ${
          type === "checkin" ? "check in" : "check out"
        }.`
      );
      return false;
    }
  };
  return (
    <View style={styles.container}>
      <Header />
      {user?.checkinStatus === "checked_in" && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#1565c0" />
          ) : (
            <>
              <Text style={styles.greeting}>
                Good Morning! {user?.firstName}
              </Text>
              <View
                style={[
                  styles.statusCard,
                  inProgressTrip ? styles.activeCard : styles.inactiveCard,
                ]}
              >
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={styles.statusDotRow}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: inProgressTrip
                            ? "#00994C"
                            : "#B71C1C",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: inProgressTrip ? "#00994C" : "#B71C1C" },
                      ]}
                    >
                      {(() => {
                        if (
                          user?.status &&
                          user?.checkinStatus !== "checked_out"
                        ) {
                          return user.status.replace(/_/g, " ");
                        }
                        if (user?.checkinStatus === "checked_out") {
                          return "Checked Out";
                        }
                        return inProgressTrip ? "Active" : "Offline";
                      })()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.timer}>
                  {inProgressTrip ? timerDisplay : "00:00:00"}
                </Text>
                <View style={styles.checkRow}>
                  <Text style={styles.checkText}>
                    {inProgressTrip
                      ? new Date(
                          inProgressTrip.tripStartDate
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </Text>
                  <Text style={styles.checkLabel}>Check in</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.checkText}>{"--:--"}</Text>
                  <Text style={styles.checkLabel}>Check out</Text>
                </View>
                <Text style={styles.dateText}>{`${
                  inProgressTrip
                    ? new Date(inProgressTrip.tripStartDate).getDate()
                    : "--"
                }-${
                  inProgressTrip
                    ? new Date(inProgressTrip.tripStartDate).toLocaleString(
                        "default",
                        { month: "short" }
                      )
                    : "--"
                }-${
                  inProgressTrip
                    ? new Date(inProgressTrip.tripStartDate).getFullYear()
                    : "--"
                }`}</Text>
                {user?.checkinStatus === "checked_in" &&
                  user?.status === "active" && (
                    <View style={styles.checkOutButtonContainer}>
                      {driverCheckOutLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#B71C1C" />
                          <Text style={styles.loadingText}>
                            Checking location...
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.checkOutButton}
                          onPress={handleDriverCheckOut}
                        >
                          <Text style={styles.checkOutButtonText}>
                            Check Out
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                <View style={styles.slideRowCentered}>
                  {inProgressTrip ? (
                    <View style={{ width: SWIPE_WIDTH, alignSelf: "center" }}>
                      {checkOutLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#00994C" />
                          <Text style={styles.loadingText}>
                            Checking location...
                          </Text>
                        </View>
                      ) : (
                        <RNSwipeButton
                          containerStyles={{
                            width: SWIPE_WIDTH,
                            alignSelf: "center",
                            backgroundColor: "transparent",
                          }}
                          height={44}
                          railBackgroundColor="#e8f8f2"
                          thumbIconBackgroundColor="#111"
                          title="Slide to stop trip"
                          titleStyles={{
                            color: "#00994C",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                          onSwipeSuccess={handleCheckOut}
                          railFillBackgroundColor="#00994C"
                          railFillBorderColor="#00994C"
                          shouldResetAfterSuccess={true}
                        />
                      )}
                    </View>
                  ) : (
                    <View style={{ width: SWIPE_WIDTH, alignSelf: "center" }}>
                      {user?.status === "reserved" ? (
                        <View style={styles.reservedContainer}>
                          <Text style={styles.reservedText}>
                            Driver is reserved
                          </Text>
                        </View>
                      ) : checkInLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#00994C" />
                          <Text style={styles.loadingText}>
                            Checking location...
                          </Text>
                        </View>
                      ) : (
                        <RNSwipeButton
                          containerStyles={{
                            width: SWIPE_WIDTH,
                            alignSelf: "center",
                            backgroundColor: "transparent",
                          }}
                          height={44}
                          railBackgroundColor="#fff"
                          thumbIconBackgroundColor="#111"
                          title="Slide to start trip"
                          titleStyles={{
                            color: "#888",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                          onSwipeSuccess={handleCheckIn}
                          railFillBackgroundColor="#00994C"
                          railFillBorderColor="#00994C"
                          shouldResetAfterSuccess={true}
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {(inProgressTrip || user?.trip) && (
                  <View style={styles.tripCard}>
                    <View style={styles.tripHeaderRowNew}>
                      <Text style={styles.hubTextBig}>
                        <Text style={{ fontWeight: "bold" }}> HUB: </Text>{" "}
                        {user?.operation?.name
                          ? user.operation.name.length > 12
                            ? user.operation.name.slice(0, 12) + "…"
                            : user.operation.name
                          : ""}
                      </Text>
                      <Text style={styles.batteryTextBig}>
                        <Text style={{ fontWeight: "bold" }}> Battery: </Text>{" "}
                        {(inProgressTrip || user?.trip)?.vehicleMetaTripStart
                          ?.location?.soc ||
                          (inProgressTrip || user?.trip)?.vehicleMetaTripStart
                            ?.location?.batteryPercentage ||
                          "N/A"}
                        %
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                        marginLeft: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripInfo}>
                          <Text style={styles.tripInfoLabel}>Assigned to:</Text>{" "}
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text style={styles.tripInfo}>
                          <Text style={styles.tripInfoLabel}>Vehicle:</Text>{" "}
                          {(inProgressTrip || user?.trip)?.vehicle?.usageType ||
                            "N/A"}
                        </Text>
                        <Text style={styles.tripInfo}>
                          <Text style={styles.tripInfoLabel}>
                            License Plate:
                          </Text>{" "}
                          {(inProgressTrip || user?.trip)?.vehicle
                            ?.licensePlate || "N/A"}
                        </Text>
                        <Text style={styles.tripInfo}>
                          <Text style={styles.tripInfoLabel}>
                            Return Vehicle:
                          </Text>{" "}
                          {(inProgressTrip || user?.trip)?.tripStartDate
                            ? (() => {
                                const start = new Date(
                                  (inProgressTrip || user?.trip).tripStartDate
                                );
                                const returnTime = new Date(
                                  start.getTime() + 8 * 60 * 60 * 1000
                                );
                                return returnTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              })()
                            : "--:--"}
                        </Text>
                      </View>
                    </View>
                    {(inProgressTrip || user?.trip)?.stops && 
                     Array.isArray((inProgressTrip || user?.trip).stops) && 
                     (inProgressTrip || user?.trip).stops.length > 0 && (
                      <View style={styles.stopsSection}>
                        <Text style={styles.stopsTitle}>Stops:</Text>
                        {(inProgressTrip || user?.trip).stops.map((stop: any, index: number) => (
                          <View key={index} style={styles.stopItem}>
                            <Text style={styles.stopNumber}>{index + 1}.</Text>
                            <Text style={styles.stopAddress}>{stop.address}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
                {reservedVehicle && (
                  <View style={styles.tripCard}>
                    <View style={styles.tripHeaderRowNew}>
                      <Text style={styles.hubTextBig}>
                        <Text style={{ fontWeight: "bold" }}>
                          {" "}
                          Reserved Vehicle
                        </Text>
                      </Text>
                      <Text style={styles.batteryTextBig}>
                        <Text style={{ fontWeight: "bold" }}> Status: </Text>{" "}
                        {inProgressTrip ? "On Trip" : "Reserved"}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                        marginLeft: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripInfo}>
                          <Text style={styles.tripInfoLabel}>
                            License Plate:
                          </Text>{" "}
                          {reservedVehicle?.licensePlate || "N/A"}
                        </Text>
                        <Text style={styles.tripInfo}>
                          <Text style={styles.tripInfoLabel}>VIN:</Text>{" "}
                          {reservedVehicle?.vin || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
              <VehicleSelectorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onVehicleSelected={handleVehicleSelect}
              />
              <Modal visible={geoErrorModal} transparent animationType="fade">
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.2)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 20,
                      padding: 28,
                      alignItems: "center",
                      width: 300,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 70,
                        color: "#F44336",
                        marginBottom: 10,
                      }}
                    >
                      ⚠️
                    </Text>
                    <Text
                      style={{
                        fontSize: 17,
                        color: "#888792",
                        textAlign: "center",
                        marginBottom: 10,
                      }}
                    >
                      {geoErrorMsg || (
                        <>
                          You are not in the operation HUB to{" "}
                          <Text style={{ color: "#1565c0" }}>Clock</Text>
                        </>
                      )}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setGeoErrorModal(false)}
                      style={{ position: "absolute", top: 10, right: 10 }}
                    >
                      <Text style={{ fontSize: 28, color: "#222" }}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>
      )}
      {user?.checkinStatus === "checked_out" &&
        (loading ? (
          <ActivityIndicator size="large" color="#1565c0" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.greeting}>Good Morning! {user?.firstName}</Text>
            <View style={[styles.statusCard, styles.inactiveCard]}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={styles.statusDotRow}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: "#B71C1C",
                      },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: "#B71C1C" }]}>
                    Checked Out
                  </Text>
                </View>
              </View>
              <View style={styles.slideRowCentered}>
                <View style={{ width: SWIPE_WIDTH, alignSelf: "center" }}>
                  {driverCheckInLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#00994C" />
                      <Text style={styles.loadingText}>
                        Checking location...
                      </Text>
                    </View>
                  ) : (
                    <RNSwipeButton
                      containerStyles={{
                        width: SWIPE_WIDTH,
                        alignSelf: "center",
                        backgroundColor: "transparent",
                      }}
                      height={44}
                      railBackgroundColor="#fff"
                      thumbIconBackgroundColor="#111"
                      title="Slide to check in"
                      titleStyles={{
                        color: "#888",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                      onSwipeSuccess={handleDriverCheckIn}
                      railFillBackgroundColor="#00994C"
                      railFillBorderColor="#00994C"
                      shouldResetAfterSuccess={true}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8f9",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
    color: "#222",
    textAlign: "center",
  },
  statusCard: {
    width: "100%",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#bdbdbd",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCard: {
    backgroundColor: "#e8f8f2",
    borderColor: "#00994C",
  },
  inactiveCard: {
    backgroundColor: "#e0e0e0",
    borderColor: "#bdbdbd",
  },
  statusRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
  },
  timer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginVertical: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  checkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginRight: 4,
  },
  checkLabel: {
    fontSize: 12,
    color: "#888",
    marginRight: 16,
  },
  dateText: {
    fontSize: 15,
    color: "#222",
    textAlign: "center",
    marginBottom: 10,
  },
  slideRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  slideRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  slideBtnActive: {
    width: 48,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  slideBtnInactive: {
    width: 48,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  slideArrow: {
    fontSize: 28,
    color: "#fff",
  },
  slideBoxActive: {
    flex: 1,
    backgroundColor: "#00994C",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  slideBoxInactive: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderWidth: 1,
    borderColor: "#bdbdbd",
  },
  slideTextActive: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  slideTextInactive: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
  swipeText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 32,
  },
  tripCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tripHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tripHeaderRowNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statusActiveTag: {
    backgroundColor: "#e8f8f2",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  statusActiveTagText: {
    color: "#00994C",
    fontWeight: "600",
    fontSize: 13,
  },
  hubText: {
    fontSize: 13,
    color: "#222",
    marginRight: 8,
  },
  hubTextBig: {
    fontSize: 16,
    color: "#222",
  },
  batteryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  batteryText: {
    fontSize: 13,
    color: "#222",
    marginLeft: 2,
  },
  batteryTextBig: {
    fontSize: 16,
    color: "#222",
  },
  tripInfo: {
    fontSize: 14,
    color: "#222",
    marginBottom: 8,
  },
  tripInfoLabel: {
    fontWeight: "600",
    color: "#222",
  },
  unassignBtn: {
    backgroundColor: "#1565c0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  unassignBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    marginBottom: 2,
  },
  logo: {
    width: 110,
    height: 38,
  },
  bellBtn: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f8f2",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#00994C",
  },
  reservedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  reservedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 65,
    width: "100%",
  },
  stopsSection: {
    marginTop: 12,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  stopNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
    marginTop: 2,
    minWidth: 20,
  },
  stopAddress: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    lineHeight: 16,
  },
  checkOutButtonContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  checkOutButton: {
    backgroundColor: "#B71C1C",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 80,
    alignItems: "center",
  },
  checkOutButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default Home;
