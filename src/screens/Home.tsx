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
import * as Linking from "expo-linking";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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
  const overlayBottomGap = 0 ;

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatHoursMinutes = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    return `${h}:${m}`;
  };

  let timerDisplay = "00:00:00";
  let loginSeconds = 0;
  if (user?.checkinStatus === "checked_in" && user?.checkinTime) {
    const diffSec = Math.floor(
      (currentTime.getTime() - new Date(user.checkinTime).getTime()) / 1000
    );
    loginSeconds = diffSec > 0 ? diffSec : 0;
    timerDisplay = formatTime(loginSeconds);
  }
  let driveSeconds = 0;
  const tripStart =
    inProgressTrip?.tripStartDate || inProgressTrip?.tripStartTime;
  if (tripStart) {
    const diffSec = Math.floor(
      (currentTime.getTime() - new Date(tripStart).getTime()) / 1000
    );
    driveSeconds = diffSec > 0 ? diffSec : 0;
  }
  const computedIdleSeconds = Math.max(0, loginSeconds - driveSeconds);
  const rawIdleTime =
    (inProgressTrip as any)?.idletime ?? (inProgressTrip as any)?.idleTime;
  const parsedIdleTime =
    rawIdleTime != null && !isNaN(Number(rawIdleTime))
      ? Number(rawIdleTime)
      : undefined;
  const effectiveIdleSeconds =
    parsedIdleTime !== undefined ? parsedIdleTime : computedIdleSeconds;
  const driveDisplay = formatHoursMinutes(driveSeconds);
  const idleDisplay = formatHoursMinutes(effectiveIdleSeconds);

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const openAppleMaps = (
    startLat: string,
    startLng: string,
    endLat: string,
    endLng: string,
    waypoints: string[]
  ) => {
    let url = `http://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}`;

    if (waypoints.length > 0) {
      const waypointStr = waypoints.join("+to:");
      url = `http://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${waypointStr}+to:${endLat},${endLng}`;
    }

    return Linking.openURL(url);
  };

  const openGoogleMaps = () => {
    const trip = inProgressTrip || user?.trip;
    if (!trip) return;

    const startLat = trip.startAddress?.latitude;
    const startLng = trip.startAddress?.longitude;
    const stops = trip.stops;

    if (
      !startLat ||
      !startLng ||
      !stops ||
      !Array.isArray(stops) ||
      stops.length === 0
    ) {
      console.error("Missing start coordinates or stops");
      return;
    }
    const lastStop = stops[stops.length - 1];
    const endLat = lastStop?.latitude;
    const endLng = lastStop?.longitude;

    if (!endLat || !endLng) {
      console.error("Missing end coordinates from last stop");
      return;
    }
    const waypoints =
      stops.length > 1
        ? stops
            .slice(0, -1)
            .filter((stop: any) => stop.latitude && stop.longitude)
            .map((stop: any) => `${stop.latitude},${stop.longitude}`)
        : [];
    let googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}`;
    if (waypoints.length > 0) {
      googleUrl += `&waypoints=${waypoints.join("|")}`;
    }
    googleUrl += "&travelmode=driving";

    Linking.openURL(googleUrl).catch((err: any) => {
      console.error("Error opening Google Maps, trying Apple Maps:", err);
      openAppleMaps(startLat, startLng, endLat, endLng, waypoints).catch(
        (appleErr: any) => {
          console.error("Error opening Apple Maps:", appleErr);
        }
      );
    });
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
  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1565c0" />
        ) : (
          <>
            <Text style={styles.greeting}>
              {getGreeting()}! {user?.firstName}!
            </Text>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{formatDate()}</Text>
            </View>
            <Text style={styles.todayActivityText}>Today's Activity</Text>
            <View style={styles.timerCard}>
              <Text style={styles.timerDisplay}>
                {user?.checkinStatus === "checked_in"
                  ? timerDisplay
                  : "00:00:00"}
              </Text>
              <View style={styles.loginTimeRow}>
                <Icon name="clock-outline" size={20} color="#1565c0" />
                <Text style={styles.loginTimeText}>Login Time</Text>
              </View>
            </View>

            {user?.status === "active" &&
            user?.checkinStatus === "checked_in" ? (
              <View style={styles.slideRowCentered}>
                {driverCheckOutLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#B71C1C" />
                    <Text style={styles.loadingText}>Checking location...</Text>
                  </View>
                ) : (
                  <RNSwipeButton
                    containerStyles={{
                      width: SWIPE_WIDTH,
                      alignSelf: "center",
                      backgroundColor: "#fff",
                      borderColor: "#B71C1C",
                      borderWidth: 1,
                      borderRadius: 16,
                    }}
                    height={56}
                    railBackgroundColor="#fff"
                    thumbIconBackgroundColor="#B71C1C"
                    thumbIconBorderColor="#B71C1C"
                    thumbIconStyles={{ borderRadius: 16 }}
                    title="Swipe to Check out"
                    titleStyles={{
                      color: "#888",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                    onSwipeSuccess={handleDriverCheckOut}
                    railFillBackgroundColor="#B71C1C"
                    railFillBorderColor="#B71C1C"
                    shouldResetAfterSuccess={true}
                  />
                )}
              </View>
            ) : (
              <></>
            )}
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.vehicleCard}>
                <View style={styles.vehicleInfoRow}>
                  <View style={styles.vehicleImagePlaceholder}>
                    <Icon name="car" size={32} color="#999" />
                  </View>
                  <View style={styles.vehicleDetails}>
                    <Text
                      style={[
                        styles.vehicleNo,
                        !reservedVehicle?.licensePlate && styles.greyedOutText,
                      ]}
                    >
                      {reservedVehicle?.licensePlate || "Vehicle No."}
                    </Text>
                    <Text
                      style={[
                        styles.vehicleNo,
                        !user?.currentLocation?.soc &&
                          user?.currentLocation?.soc !== 0 &&
                          styles.greyedOutText,
                      ]}
                    >
                      {user?.currentLocation?.soc != null
                        ? `${user.currentLocation.soc}%`
                        : "SOC."}
                    </Text>
                  </View>
                  {user?.status === "active" && (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={handleCheckIn}
                    >
                      <Text style={styles.assignButtonText}>Assign</Text>
                      <Icon name="chevron-right" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.activityCardsRow}>
                <View style={styles.activityCard}>
                  <Text
                    style={[
                      styles.activityValue,
                      !user?.trip && styles.greyedOutText,
                    ]}
                  >
                    {driveDisplay}
                  </Text>
                  <View style={styles.activityIconRow}>
                    <Icon
                      name="steering"
                      size={20}
                      color={!user?.trip ? "#CCCCCC" : "#666"}
                    />
                    <Text
                      style={[
                        styles.activityLabel,
                        !user?.trip && styles.greyedOutText,
                      ]}
                    >
                      Drive Time
                    </Text>
                  </View>
                </View>
                <View style={styles.activityCard}>
                  <Text
                    style={[
                      styles.activityValue,
                      !user?.trip && styles.greyedOutText,
                    ]}
                  >
                    {user?.distanceCovered?.toFixed(0) || "0"} Kms
                  </Text>
                  <View style={styles.activityIconRow}>
                    <Icon
                      name="map-marker-distance"
                      size={20}
                      color={!user?.trip ? "#CCCCCC" : "#666"}
                    />
                    <Text
                      style={[
                        styles.activityLabel,
                        !user?.trip && styles.greyedOutText,
                      ]}
                    >
                      Distance
                    </Text>
                  </View>
                </View>
                <View style={styles.activityCard}>
                  <Text
                    style={[
                      styles.activityValue,
                      !user?.trip && styles.greyedOutText,
                    ]}
                  >
                    {idleDisplay}
                  </Text>
                  <View style={styles.activityIconRow}>
                    <Icon
                      name="clock-outline"
                      size={20}
                      color={!user?.trip ? "#CCCCCC" : "#666"}
                    />
                    <Text
                      style={[
                        styles.activityLabel,
                        !user?.trip && styles.greyedOutText,
                      ]}
                    >
                      Idle Time
                    </Text>
                  </View>
                </View>
              </View>
              {inProgressTrip && (
                <View style={styles.returnVehicleContainer}>
                  {checkOutLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#B71C1C" />
                      <Text style={styles.loadingText}>
                        Checking location...
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.returnVehicleButton}
                      onPress={handleCheckOut}
                    >
                      <Text style={styles.returnVehicleButtonText}>
                        Return Vehicle
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View>
                {(inProgressTrip || user?.trip)?.stops &&
                  Array.isArray((inProgressTrip || user?.trip).stops) &&
                  (inProgressTrip || user?.trip).stops.length > 0 && (
                    <View style={styles.tripCard}>
                      <View style={styles.stopsSection}>
                        <Text style={styles.stopsTitle}>Stops:</Text>
                        {(inProgressTrip || user?.trip).stops.map(
                          (stop: any, index: number) => (
                            <View key={index} style={styles.stopItem}>
                              <Text style={styles.stopNumber}>
                                {index + 1}.
                              </Text>
                              <Text style={styles.stopAddress}>
                                {stop.address}
                              </Text>
                            </View>
                          )
                        )}
                      </View>
                    </View>
                  )}
                {(inProgressTrip || user?.trip)?.stops &&
                  Array.isArray((inProgressTrip || user?.trip).stops) &&
                  (inProgressTrip || user?.trip).stops.length > 0 &&
                  (inProgressTrip || user?.trip)?.startAddress?.latitude && (
                    <View style={styles.navigationSection}>
                      <TouchableOpacity
                        style={styles.navigationButton}
                        onPress={openGoogleMaps}
                      >
                        <Text style={styles.navigationButtonText}>
                          Open in Maps
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
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
      {user?.checkinStatus === "checked_out" && (
              <View
                pointerEvents="box-none"
                style={[
                  styles.overlayFloatingContainer,
                  { bottom: overlayBottomGap },
                ]}
              >
                <View
                  style={[
                    styles.overlayBackdrop,
                  ]}
                >
                  <View style={styles.overlayCard}>
                    <Icon name="lock-outline" size={40} color="#fff" />
                    <Text style={styles.overlayTitle}>Check-in</Text>
                    <Text style={styles.overlaySubtitle}>
                      to book a vehicle
                    </Text>
                    <View style={styles.slideRowCentered}>
                      {driverCheckInLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={styles.loadingText}>
                            Checking location...
                          </Text>
                        </View>
                      ) : (
                        <RNSwipeButton
                          containerStyles={{
                            width: SWIPE_WIDTH,
                            alignSelf: "center",
                            backgroundColor: "#fff",
                            borderColor: "#1565c0",
                            borderWidth: 1,
                            borderRadius: 16,
                          }}
                          height={56}
                          railBackgroundColor="#fff"
                          thumbIconBackgroundColor="#1565c0"
                          thumbIconBorderColor="#1565c0"
                          thumbIconStyles={{ borderRadius: 16 }}
                          title="Swipe to Check-in"
                          titleStyles={{
                            color: "#888",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                          onSwipeSuccess={handleDriverCheckIn}
                          railFillBackgroundColor="#1565c0"
                          railFillBorderColor="#1565c0"
                          shouldResetAfterSuccess={true}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "300",
    marginTop: 8,
    marginBottom: 16,
    color: "#222",
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
  },
  dateHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 4,
  },
  todayActivityText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  timerCard: {
    width: "70%",
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 8,
  },
  loginTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
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
  vehicleCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleNo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 14,
    color: "#666",
  },
  assignButton: {
    backgroundColor: "#1565c0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  activityCardsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  activityCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activityValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  activityIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activityLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 90,
    width: "100%",
  },
  stopsSection: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
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
  navigationSection: {
    marginTop: 12,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navigationButton: {
    backgroundColor: "#0070F0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  navigationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 5, 6, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  overlayFloatingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
  },
  overlayCard: {
    width: "92%",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    marginBottom: 6,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
  },
  returnVehicleContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  returnVehicleButton: {
    width: Math.round(Dimensions.get("window").width * 0.7),
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#B71C1C",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  returnVehicleButtonText: {
    color: "#B71C1C",
    fontSize: 18,
    fontWeight: "700",
  },
  greyedOutText: {
    color: "#CCCCCC",
  },
});

export default Home;
