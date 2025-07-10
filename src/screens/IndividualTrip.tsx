import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Header from "../components/ui/Header";
import { useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { RouteProp } from "@react-navigation/native";
import { TripCard } from "./Trip";
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from "react-native-maps";
import { backendService } from "../services/api/backend.service";

const IndividualTrip = () => {
  const route = useRoute<RouteProp<RootStackParamList, "IndividualTrip">>();
  const { trip } = route.params || {};
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTripData = async () => {
      setLoading(true);
      const data = await backendService.getTrip(trip.id);
      setTripData(data);
      setLoading(false);
    };
    fetchTripData();
  }, [trip]);

  const startLat = tripData?.startAddress?.latitude;
  const startLng = tripData?.startAddress?.longitude;
  const endLat = tripData?.endAddress?.latitude;
  const endLng = tripData?.endAddress?.longitude;

  let coordinates: { latitude: number; longitude: number }[] = [];

  if (Array.isArray(tripData?.dataPoints) && tripData.dataPoints.length > 0) {
    coordinates = tripData.dataPoints.map((pt: any) => ({
      latitude: pt.latitude,
      longitude: pt.longitude,
    }));
    if (
      startLat &&
      startLng &&
      (coordinates.length === 0 ||
        coordinates[0].latitude !== startLat ||
        coordinates[0].longitude !== startLng)
    ) {
      coordinates.unshift({ latitude: startLat, longitude: startLng });
    }
    if (
      endLat &&
      endLng &&
      (coordinates.length === 0 ||
        coordinates[coordinates.length - 1].latitude !== endLat ||
        coordinates[coordinates.length - 1].longitude !== endLng)
    ) {
      coordinates.push({ latitude: endLat, longitude: endLng });
    }
  } else if (startLat && startLng && endLat && endLng) {
    coordinates = [
      { latitude: startLat, longitude: startLng },
      { latitude: endLat, longitude: endLng },
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

  return (
    <View style={styles.container}>
      <Header />
      <View style={{ marginTop: 16 }}>
        <TripCard trip={trip} />
      </View>
      <View style={styles.mapContainer}>
        {loading ? (
          <Text style={styles.mapPlaceholder}>Loading...</Text>
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
            {startLat && startLng && (
              <Marker
                coordinate={{ latitude: startLat, longitude: startLng }}
                title="Start"
                pinColor="green"
              />
            )}
            {endLat && endLng && (
              <Marker
                coordinate={{ latitude: endLat, longitude: endLng }}
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
