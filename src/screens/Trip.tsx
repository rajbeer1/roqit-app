import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Header from "../components/ui/Header";
import { useUserStore } from "../store/user.store";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type TripScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IndividualTrip'>;


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

export const TripCard = ({ trip, navigation }: { trip: any; navigation?: TripScreenNavigationProp }) => {
  const tripDate = trip.tripStartDate ? new Date(trip.tripStartDate) : null;
  
  const handleViewTrip = () => {
    if (navigation) {
      navigation.navigate('IndividualTrip', { trip });
    }
  };
  
  return (
    <View style={styles.tripCard}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
        <View style={styles.vehicleImg}>
          <MaterialCommunityIcons name="car" size={42} color="#888" style={{ alignSelf: 'center' }} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: '#888', fontSize: 13 }}>Vehicle</Text>
          <Text style={styles.licensePlate}>{trip.vehicle?.licensePlate || '--'}</Text>
        </View>
        {navigation && (
          <TouchableOpacity onPress={handleViewTrip}>
            <Text style={styles.viewLink}>View</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
        <Text style={styles.weekdayText}>
          <Text style={{ color: '#0047BA', fontWeight: 'bold', fontSize: 18 }}>
            {getWeekday(trip.tripStartDate)}
          </Text>{' '}
          <Text style={{ color: '#0047BA', fontWeight: 'bold', fontSize: 18 }}>
            {tripDate ? String(tripDate.getDate()).padStart(2, '0') : '--'}
          </Text>
        </Text>
        <View style={styles.checkRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Check In</Text>
            <Text style={styles.checkText}>{formatTime(trip.tripStartDate)}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.checkLabel}>Check Out</Text>
            <Text style={styles.checkText}>{formatTime(trip.tripEndDate)}</Text>
          </View>
        </View>
        <View style={styles.driveRow}>
          <Text style={styles.driveTimeText}>
            Drive Time {getDriveTime(trip.tripStartDate, trip.tripEndDate)}Hrs
          </Text>
          <Text style={styles.dateText}>
            Date: {tripDate ? tripDate.toLocaleDateString() : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const TripStats = ({ stats }: { stats: { loginTime: string; totalDistance: string; vehicles: string } }) => (
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

const ScoreCard = ({ tripsUnder8Hours = '0',totalTrips = 0, score = 'N/A' }) => (
  <View style={styles.scoreCardContainer}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text style={styles.scoreCardTitle}>Score - Vehicle reached on time</Text>
        <Text style={styles.scoreCardDays}><Text style={{ color: '#0070F0', fontWeight: 'bold', fontSize: 24 }}>{tripsUnder8Hours}/{totalTrips}</Text> <Text style={{ color: '#222', fontSize: 18 }}>days</Text></Text>
      </View>
      <View style={styles.scoreCardScoreBox}>
        <Text style={styles.scoreCardScoreLabel}>Score</Text>
        <Text style={styles.scoreCardScore}>{score}</Text>
      </View>
    </View>
    <MaterialCommunityIcons name="star-four-points-outline" size={18} color="#0070F0" style={{ position: 'absolute', top: 10, right: 10 }} />
  </View>
);

const Trip = () => {
  const navigation = useNavigation<TripScreenNavigationProp>();
  const { trips, loading, stats, tripsUnder8Hours } = useUserStore();
  const sortedTrips = trips && Array.isArray(trips)
    ? [...trips].sort((a, b) => new Date(b.tripStartDate).getTime() - new Date(a.tripStartDate).getTime())
    : [];



  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <TripStats stats={stats} />
        <ScoreCard tripsUnder8Hours={tripsUnder8Hours} totalTrips={Number(trips?.length)}/>
        <View style={styles.content}>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>
          ) : !sortedTrips || sortedTrips.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>No trips found.</Text>
          ) : (
            <FlatList
              data={sortedTrips}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TripCard trip={item} navigation={navigation} />}
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
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  tripCard: {
    width: "95%",
    alignSelf: 'center',
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vehicleImg: {
    width: 48,
    height: 48,
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
  viewLink: {
    color: '#0047BA',
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: '#e8f3fa',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  driveTimeText: {
    fontSize: 12,
    color: '#222',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#0047BA',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0047BA',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 13,
    color: '#888',
  },
  scoreCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  scoreCardTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 6,
  },
  scoreCardDays: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scoreCardScoreBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginLeft: 10,
  },
  scoreCardScoreLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  scoreCardScore: {
    color: '#0070F0',
    fontWeight: 'bold',
    fontSize: 28,
  },
});

export default Trip;
