import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Header from "../components/ui/Header";
import { useUserStore } from "../store/user.store";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type TripScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "IndividualTrip"
>;

const formatTime = (dateStr: string) => {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDriveTime = (start: string, end: string) => {
  if (!start || !end) return "--";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMin = Math.floor((diffMs % 3600000) / 60000);
  return `${diffHrs.toString().padStart(2, "0")}:${diffMin
    .toString()
    .padStart(2, "0")}`;
};

const getWeekday = (dateStr: string) => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "long" });
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "--/--/----";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB");
};

const formatHoursMinutesFromSeconds = (sec?: number | string) => {
  if (sec == null || isNaN(Number(sec))) return "--";
  const total = Math.max(0, Number(sec));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  return `${h}:${m}`;
};

export const TripCard = ({
  trip,
  navigation,
  backButton = false,
}: {
  trip: any;
  navigation?: TripScreenNavigationProp;
  backButton?: boolean;
}) => {
  const tripDate = trip.tripStartDate ? new Date(trip.tripStartDate) : null;

  const handlePress = () => {
    if (navigation) {
      navigation.navigate("IndividualTrip", { trip });
    }
    if (backButton && navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.tripCard}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleImg}>
          <MaterialCommunityIcons name="car" size={42} color="#888" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.licensePlate}>
            {trip.vehicle?.licensePlate || "--"}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <MaterialCommunityIcons
              name="card-text-outline"
              size={16}
              color="#b0b0b0"
            />
            <Text style={styles.vehicleNoLabel}> Vehicle No.</Text>
          </View>
        </View>
        {navigation && (
          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.viewLink}>
              {backButton ? "Back" : "View Details"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.timesRow}>
        <View style={styles.timeCol}>
          <View style={[styles.statusDot, { backgroundColor: "#2e7d32" }]}>
            <MaterialCommunityIcons name="play" size={10} color="#fff" />
          </View>
          <Text style={styles.timeText}>{formatTime(trip.tripStartDate)}</Text>
          <Text style={styles.dateMuted}>
            {formatDateShort(trip.tripStartDate)}
          </Text>
        </View>
        <View style={styles.timeCol}>
          <View style={[styles.statusDot, { backgroundColor: "#c62828" }]}>
            <MaterialCommunityIcons name="close" size={10} color="#fff" />
          </View>
          <Text style={styles.timeText}>{formatTime(trip.tripEndDate)}</Text>
          <Text style={styles.dateMuted}>
            {formatDateShort(trip.tripEndDate)}
          </Text>
        </View>
      </View>
      {navigation && (
        <View style={styles.activityCardsRow}>
          <View style={styles.activityCard}>
            <Text style={styles.activityValue}>
              {getDriveTime(trip.tripStartDate, trip.tripEndDate)}
            </Text>
            <View style={styles.activityIconRow}>
              <MaterialCommunityIcons name="steering" size={18} color="#666" />
              <Text style={styles.activityLabel}>Drive Time</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityValue}>
              {typeof trip?.distance === "number"
                ? `${trip.distance} Kms`
                : "-- Kms"}
            </Text>
            <View style={styles.activityIconRow}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={18}
                color="#666"
              />
              <Text style={styles.activityLabel}>Distance</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityValue}>
              {formatHoursMinutesFromSeconds(
                (trip as any)?.idletime ?? (trip as any)?.idleTime
              )}
            </Text>
            <View style={styles.activityIconRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color="#666"
              />
              <Text style={styles.activityLabel}>Idle Time</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const TripStats = ({
  stats,
}: {
  stats: { loginTime: string; totalDistance: string; vehicles: string };
}) => (
  <View style={styles.statsRow}>
    <View style={styles.statsCard}>
      <Text style={styles.statsValue}>{stats.loginTime}</Text>
      <Text style={styles.statsLabel}>Login Time</Text>
    </View>
    <View style={styles.statsCard}>
      <Text style={styles.statsValue}>{stats.totalDistance}</Text>
      <Text style={styles.statsLabel}>Total Distance</Text>
    </View>
    <View style={styles.statsCard}>
      <Text style={styles.statsValue}>{stats.vehicles}</Text>
      <Text style={styles.statsLabel}>Vehicles</Text>
    </View>
  </View>
);

const ScoreCard = ({
  tripsUnder8Hours = "0",
  totalTrips = 0,
  score = "N/A",
}) => (
  <View style={styles.scoreCardContainer}>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.scoreCardTitle}>
          Score - Vehicle reached on time
        </Text>
        <Text style={styles.scoreCardDays}>
          <Text style={{ color: "#0070F0", fontWeight: "bold", fontSize: 24 }}>
            {tripsUnder8Hours}/{totalTrips}
          </Text>{" "}
          <Text style={{ color: "#222", fontSize: 18 }}>days</Text>
        </Text>
      </View>
      <View style={styles.scoreCardScoreBox}>
        <Text style={styles.scoreCardScoreLabel}>Score</Text>
        <Text style={styles.scoreCardScore}>{score}</Text>
      </View>
    </View>
    <MaterialCommunityIcons
      name="star-four-points-outline"
      size={18}
      color="#0070F0"
      style={{ position: "absolute", top: 10, right: 10 }}
    />
  </View>
);

const Trip = () => {
  const navigation = useNavigation<TripScreenNavigationProp>();
  const { trips, loading, stats, tripsUnder8Hours } = useUserStore();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const sortedTrips =
    trips && Array.isArray(trips)
      ? [...trips].sort(
          (a, b) =>
            new Date(b.tripStartDate).getTime() -
            new Date(a.tripStartDate).getTime()
        )
      : [];

  const daysInMonth: Date[] = useMemo(() => {
    const start = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1
    );
    const end = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
    );
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [visibleMonth]);

  const monthLabel = useMemo(
    () =>
      visibleMonth.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      }),
    [visibleMonth]
  );

  const filteredTrips = useMemo(() => {
    return sortedTrips.filter((t) => {
      if (!t.tripStartDate) return false;
      const td = new Date(t.tripStartDate);
      return (
        td.getFullYear() === selectedDate.getFullYear() &&
        td.getMonth() === selectedDate.getMonth() &&
        td.getDate() === selectedDate.getDate()
      );
    });
  }, [sortedTrips, selectedDate]);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 85 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date strip */}
        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
          <View style={styles.stripHeaderRow}>
            <Text style={styles.stripTitle}>At a glimpse of your trips</Text>
            <View style={styles.monthSelector}>
              <TouchableOpacity
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                style={styles.monthArrowBtn}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={20}
                  color="#222"
                />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <TouchableOpacity
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                style={styles.monthArrowBtn}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#222"
                />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {daysInMonth.map((d) => {
              const isSelected =
                d.getFullYear() === selectedDate.getFullYear() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getDate() === selectedDate.getDate();
              return (
                <TouchableOpacity
                  key={d.toISOString()}
                  onPress={() => setSelectedDate(new Date(d))}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                >
                  <Text
                    style={[
                      styles.dayChipWeek,
                      isSelected && styles.dayChipWeekSelected,
                    ]}
                  >
                    {d
                      .toLocaleDateString(undefined, { weekday: "short" })
                      .slice(0, 2)}
                  </Text>
                  <Text
                    style={[
                      styles.dayChipDate,
                      isSelected && styles.dayChipDateSelected,
                    ]}
                  >
                    {String(d.getDate()).padStart(2, "0")}
                  </Text>
                  {isSelected && <View style={styles.dayChipDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.content}>
          {loading ? (
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              Loading...
            </Text>
          ) : !filteredTrips || filteredTrips.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
              No trips found.
            </Text>
          ) : (
            <FlatList
              data={filteredTrips}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TripCard trip={item} navigation={navigation} />
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 0 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
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
    width: "100%",
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  tripCard: {
    width: "95%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  vehicleImg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  imgPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  vehicleNoLabel: {
    color: "#9e9e9e",
    fontSize: 13,
  },
  viewLink: {
    color: "#0047BA",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  timesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  timeCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginRight: 10,
  },
  dateMuted: {
    fontSize: 12,
    color: "#9e9e9e",
  },
  activityCardsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activityValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 6,
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
  weekdayText: {
    marginTop: 2,
    marginBottom: 2,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 2,
  },
  checkLabel: {
    fontSize: 12,
    color: "#888",
  },
  checkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0047BA",
    marginTop: 2,
  },
  driveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  driveTimeText: {
    fontSize: 12,
    color: "#222",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
    color: "#0047BA",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0047BA",
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 13,
    color: "#888",
  },
  scoreCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    position: "relative",
  },
  scoreCardTitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 6,
  },
  scoreCardDays: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  scoreCardScoreBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginLeft: 10,
  },
  scoreCardScoreLabel: {
    color: "#888",
    fontSize: 13,
    marginBottom: 2,
  },
  scoreCardScore: {
    color: "#0070F0",
    fontWeight: "bold",
    fontSize: 28,
  },
  stripHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stripTitle: {
    color: "#888",
    fontSize: 14,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthArrowBtn: {
    padding: 2,
    marginHorizontal: 2,
  },
  monthLabel: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 6,
  },
  dayChip: {
    width: 64,
    height: 84,
    borderRadius: 16,
    backgroundColor: "#eee",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipSelected: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#bbdefb",
  },
  dayChipWeek: {
    color: "#999",
    fontSize: 12,
    marginBottom: 2,
  },
  dayChipWeekSelected: {
    color: "#1565c0",
    fontWeight: "700",
  },
  dayChipDate: {
    color: "#666",
    fontSize: 16,
    fontWeight: "700",
  },
  dayChipDateSelected: {
    color: "#1565c0",
  },
  dayChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1e88e5",
    marginTop: 6,
  },
});

export default Trip;
