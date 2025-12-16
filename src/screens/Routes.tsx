import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Header from "../components/ui/Header";
import { useUserStore } from "../store/user.store";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DistanceIcon } from "../components/icons/DistanceIcon";
import { DurationIcon } from "../components/icons/DurationIcon";

type RoutesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RouteDetails"
>;

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "--/--/----";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB");
};

const formatDistance = (meters?: number) => {
  if (meters == null || isNaN(meters)) return "-- kms";
  const km = meters / 1000;
  return `${km.toFixed(0)} kms`;
};

const formatEtaHours = (seconds?: number) => {
  if (seconds == null || isNaN(seconds)) return "-- hours";
  const hours = seconds / 3600;
  if (hours < 1) {
    const mins = Math.round(seconds / 60);
    return `${mins} mins`;
  }
  return `${hours.toFixed(1)} hours`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

interface RouteCardProps {
  route: any;
  isActive: boolean;
  navigation: RoutesScreenNavigationProp;
}

const RouteCard = ({ route, isActive, navigation }: RouteCardProps) => {
  const childTripsCount = route.childTrips?.length || 0;
  const routeId = route.id?.slice(-4)?.toUpperCase() || "----";

  const handlePress = () => {
    navigation.navigate("RouteDetails", { route });
  };

  return (
    <TouchableOpacity
      style={[styles.routeCard, isActive && styles.routeCardActive]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.routeCardHeader}>
        <View style={styles.headerInfoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.labelText}>Route ID : R{routeId}</Text>
            <Text style={styles.valueText}>{childTripsCount} Trips</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.labelText}>Date</Text>
            <Text style={styles.valueText}>
              {formatDateShort(route.tripStartDate)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handlePress} style={styles.detailsButton}>
          <Text style={styles.detailsText}>Details</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color="#0873DE"
          />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats Row */}
      <View style={styles.routeCardStats}>
        <View style={styles.statItem}>
          <DistanceIcon />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>
              {formatDistance(route.routeDistance)}
            </Text>
            <Text style={styles.statLabel}>Estimated Distance</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <DurationIcon />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{formatEtaHours(route.routeEta)}</Text>
            <Text style={styles.statLabel}>Estimated Duration</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Routes = () => {
  const navigation = useNavigation<RoutesScreenNavigationProp>();
  const { loading, user } = useUserStore();

  // Use user?.trips directly to get all trips (not just completed ones from store)
  const routeTrips = useMemo(() => {
    const allTrips = user?.trips;
    if (!allTrips || !Array.isArray(allTrips)) return [];
    return allTrips
      .filter((trip) => trip.triptype === "route")
      .sort(
        (a, b) =>
          new Date(b.tripStartDate).getTime() -
          new Date(a.tripStartDate).getTime()
      );
  }, [user?.trips]);

  const { activeRoutes, historyRoutes } = useMemo(() => {
    const active = routeTrips.filter(
      (route) => route.status === "In Progress" || route.status === "Assigned"
    );
    const history = routeTrips.filter(
      (route) => route.status === "Complete" || route.status === "Cancelled"
    );
    return { activeRoutes: active, historyRoutes: history };
  }, [routeTrips]);
  
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          {getGreeting()}! {user?.firstName || "User"}!
        </Text>

        <Text style={styles.sectionTitle}>All Routes</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0873DE" />
          </View>
        ) : routeTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="routes" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No routes found</Text>
          </View>
        ) : (
          <>
            {activeRoutes.length > 0 && (
              <>
                <View style={styles.statusHeader}>
                  <View style={[styles.statusDot, styles.activeDot]} />
                  <Text style={[styles.statusText, styles.activeText]}>
                    Active
                  </Text>
                </View>
                {activeRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isActive={true}
                    navigation={navigation}
                  />
                ))}
              </>
            )}

            {historyRoutes.length > 0 && (
              <>
                <View style={styles.statusHeader}>
                  <View style={[styles.statusDot, styles.historyDot]} />
                  <Text style={[styles.statusText, styles.historyText]}>
                    History
                  </Text>
                </View>
                {historyRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isActive={false}
                    navigation={navigation}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8f9",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: "#4caf50",
  },
  historyDot: {
    backgroundColor: "#9e9e9e",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeText: {
    color: "#4caf50",
  },
  historyText: {
    color: "#9e9e9e",
  },
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    gap: 12,
  },
  routeCardActive: {
    borderColor: "#0873DE",
    borderWidth: 1,
  },
  routeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 72,
  },
  infoColumn: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 4,
  },
  labelText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: "#A6A6A6",
  },
  valueText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: "#262626",
  },
  detailsButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#0873DE",
  },
  detailsText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#0873DE",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    alignSelf: "stretch",
  },
  routeCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  statTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    lineHeight: 14,
    color: "#262626",
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 12,
    color: "#8C8C8C",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 12,
  },
});

export default Routes;
