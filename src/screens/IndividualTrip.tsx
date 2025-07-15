import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import Header from "../components/ui/Header";
import { useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { TripCard } from "./Trip";
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from "react-native-maps";
import { backendService } from "../services/api/backend.service";
import { StackNavigationProp } from "@react-navigation/stack";

type TripScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "IndividualTrip"
>;

const IndividualTrip = () => {
  const route = useRoute<RouteProp<RootStackParamList, "IndividualTrip">>();
  const navigation = useNavigation<TripScreenNavigationProp>();
  const { trip } = route.params || {};
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!trip?.id) {
        setError("Invalid trip data");
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const data = await backendService.getTrip(trip.id);
        setTripData(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };
    fetchTripData();
  }, [trip]);

  const isValidCoordinate = (lat: any, lng: any): boolean => {
    return (
      lat != null &&
      lng != null &&
      !isNaN(Number(lat)) &&
      !isNaN(Number(lng)) &&
      Number(lat) >= -90 &&
      Number(lat) <= 90 &&
      Number(lng) >= -180 &&
      Number(lng) <= 180
    );
  };

  const startLat = tripData?.startAddress?.latitude;
  const startLng = tripData?.startAddress?.longitude;
  const endLat = tripData?.endAddress?.latitude;
  const endLng = tripData?.endAddress?.longitude;

  let coordinates: { latitude: number; longitude: number }[] = [];

  if (Array.isArray(tripData?.dataPoints) && tripData.dataPoints.length > 0) {
    coordinates = tripData.dataPoints
      .filter((pt: any) => isValidCoordinate(pt.latitude, pt.longitude))
      .map((pt: any) => ({
        latitude: Number(pt.latitude),
        longitude: Number(pt.longitude),
      }));
    
    if (isValidCoordinate(startLat, startLng)) {
      const startCoord = { latitude: Number(startLat), longitude: Number(startLng) };
      if (coordinates.length === 0 || 
          coordinates[0].latitude !== startCoord.latitude || 
          coordinates[0].longitude !== startCoord.longitude) {
        coordinates.unshift(startCoord);
      }
    }

    if (isValidCoordinate(endLat, endLng)) {
      const endCoord = { latitude: Number(endLat), longitude: Number(endLng) };
      if (coordinates.length === 0 || 
          coordinates[coordinates.length - 1].latitude !== endCoord.latitude || 
          coordinates[coordinates.length - 1].longitude !== endCoord.longitude) {
        coordinates.push(endCoord);
      }
    }
  } else if (isValidCoordinate(startLat, startLng) && isValidCoordinate(endLat, endLng)) {
    coordinates = [
      { latitude: Number(startLat), longitude: Number(startLng) },
      { latitude: Number(endLat), longitude: Number(endLng) },
    ];
  }

  const initialRegion =
    coordinates.length > 0
      ? {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={{ marginTop: 16 }}>
        <TripCard trip={trip} backButton={true} navigation={navigation} />
      </View>
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1565c0" />
            <Text style={styles.loadingText}>Loading trip data...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
          >
            {coordinates.length > 0 && (
              <Polyline
                coordinates={coordinates}
                strokeColor="#0070F0"
                strokeWidth={4}
              />
            )}
            {isValidCoordinate(startLat, startLng) && (
              <Marker
                coordinate={{ latitude: Number(startLat), longitude: Number(startLng) }}
                title="Start"
                pinColor="green"
              />
            )}
            {isValidCoordinate(endLat, endLng) && (
              <Marker
                coordinate={{ latitude: Number(endLat), longitude: Number(endLng) }}
                title="End"
                pinColor="red"
              />
            )}
          </MapView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8f9",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 8,
  },
  mapPlaceholder: {
    color: "#888",
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});

export { IndividualTrip };
