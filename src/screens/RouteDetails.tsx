import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PhoneCircle } from "../components/icons/PhoneCircle";
import { useUserStore } from "../store/user.store";
import CompleteStopModal from "../components/ui/CompleteStopModal";
import StopDetailsModal from "../components/ui/StopDetailsModal";
import TripDetailsModal from "../components/ui/TripDetailsModal";
import { backendService } from "../services/api/backend.service";
import { showSuccessToast, showErrorToast } from "../services/ui/toasts";

type RouteDetailsRouteProp = RouteProp<RootStackParamList, "RouteDetails">;
type RouteDetailsNavigationProp = StackNavigationProp<RootStackParamList, "RouteDetails">;

interface Stop {
  latitude: string;
  longitude: string;
  address: string;
  tripId: string;
  pointType: "start" | "end";
  originalTripId?: string;
}

interface CurrentStop {
  tripId: string | null;
  pointType: "start" | "end" | null;
}

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

interface TripGroup {
  tripId: string;
  stops: Stop[];
}

const RouteDetails = () => {
  const navigation = useNavigation<RouteDetailsNavigationProp>();
  const routeParams = useRoute<RouteDetailsRouteProp>();
  const { route: initialRouteData } = routeParams.params || {};
  const { user, fetchUser } = useUserStore();

  const [activeTab, setActiveTab] = useState<"task" | "trip">("task");
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [tripDetailsModalVisible, setTripDetailsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<any>(initialRouteData);


  const routeId = routeData?.id?.slice(-4)?.toUpperCase() || "----";
  const routeStatus: string = routeData?.status || "";
  const currentStop: CurrentStop | null = routeData?.currentStop || null;
  const stops: Stop[] = routeData?.stops || [];
  const childTrips: string[] = routeData?.childTrips || [];

  // startAddress and endAddress are objects with address, originalTripId, etc.
  const startAddressObj = routeData?.startAddress || null;
  const endAddressObj = routeData?.endAddress || null;
  const routeStartAddress: string = startAddressObj?.address || "";
  const routeEndAddress: string = endAddressObj?.address || "";
  const routeStartOriginalTripId: string = startAddressObj?.originalTripId || "";
  const routeEndOriginalTripId: string = endAddressObj?.originalTripId || "";

  // Get trips array from routeData
  const trips = routeData?.trips || [];

  const getCustomerDetails = (tripId: string, pointType: "start" | "end" | "route_start" | "route_end") => {
    // Find the trip by tripId
    const trip = user?.trips?.find((t: any) => t.id === tripId || t.tripId === tripId);

    if (!trip) { 
      return { name: "", phone: "" };
    }

    // Determine which address object to use based on pointType
    // route_start maps to startAddress, route_end maps to endAddress
    const addressKey = pointType === "start" || pointType === "route_start" ? "startAddress" : "endAddress";
    const addressObj = trip[addressKey];

    return {
      name: addressObj?.contactName || "",
      phone: addressObj?.phoneNumber || "",
    };
  };

  // Check if a stop is completed (currentStop and all before it are completed)
  const isStopCompleted = (_stop: Stop, stopIndex: number): boolean => {
    // If route is complete, all stops are completed
    if (routeStatus === "Complete") {
      return true;
    }

    if (!currentStop || !currentStop.tripId) {
      return false;
    }

    // Find the index of currentStop in stops array
    const currentStopIndex = stops.findIndex(
      (s) => s.tripId === currentStop.tripId && s.pointType === currentStop.pointType
    );

    if (currentStopIndex === -1) {
      return false;
    }

    // All stops up to and including currentStop are completed
    return stopIndex <= currentStopIndex;
  };

  const taskList: TaskItem[] = useMemo(() => {
    const tasks: TaskItem[] = [];

    // If route is complete, all tasks are completed and none are active
    const isRouteComplete = routeStatus === "Complete";

    // Find currentStop index to determine route start completion
    const currentStopIndex = currentStop?.tripId
      ? stops.findIndex(
          (s) => s.tripId === currentStop.tripId && s.pointType === currentStop.pointType
        )
      : -1;

    // Determine if route_start exists
    const hasRouteStart = !!routeStartAddress;

    // Route start is completed if route is complete OR there's a currentStop (meaning we've moved past the start)
    const isRouteStartCompleted = isRouteComplete || currentStopIndex >= 0;
    // Route start is active only if route is in progress and no currentStop exists (first thing to do)
    const isRouteStartActive = !isRouteComplete && !currentStop?.tripId;

    // Add route start address at the beginning
    if (routeStartAddress) {
      const customer = getCustomerDetails(routeStartOriginalTripId, "route_start");
      tasks.push({
        address: routeStartAddress.split(",")[0],
        fullAddress: routeStartAddress,
        tripId: routeStartOriginalTripId,
        originalTripId: routeStartOriginalTripId,
        pointType: "start",
        isCompleted: isRouteStartCompleted,
        isCurrentStop: isRouteStartActive,
        customerName: customer.name,
        customerPhone: customer.phone,
        latitude: startAddressObj?.latitude,
        longitude: startAddressObj?.longitude,
      });
    }

    // Add all stops
    stops.forEach((stop, index) => {
      const shortAddress = stop.address.split(",")[0];
      const customer = getCustomerDetails(stop.tripId, stop.pointType);

      // When route is complete, no stop is active
      // When currentStop is null and route_start exists, no stop should be active
      // When currentStop is null and NO route_start, first stop (index 0) should be active
      let isActive = false;
      if (!isRouteComplete) {
        if (!currentStop?.tripId) {
          // No currentStop - only active if no route_start and this is first stop
          isActive = !hasRouteStart && index === 0;
        } else {
          // Has currentStop - next stop after currentStop is active
          isActive = index === currentStopIndex + 1;
        }
      }

      tasks.push({
        address: shortAddress,
        fullAddress: stop.address,
        tripId: stop.tripId,
        originalTripId: stop.originalTripId,
        pointType: stop.pointType,
        isCompleted: isStopCompleted(stop, index),
        isCurrentStop: isActive,
        customerName: customer.name,
        customerPhone: customer.phone,
        latitude: stop.latitude,
        longitude: stop.longitude,
      });
    });

    // Add route end address at the end
    if (routeEndAddress) {
      // Route end is completed if route is complete
      // Route end is active if all stops are completed and route is not complete
      const allStopsCompleted = stops.length > 0 && currentStopIndex === stops.length - 1;
      const customer = getCustomerDetails(routeEndOriginalTripId, "route_end");
      tasks.push({
        address: routeEndAddress.split(",")[0],
        fullAddress: routeEndAddress,
        tripId: routeEndOriginalTripId || "route_end",
        originalTripId: routeEndOriginalTripId,
        pointType: "end",
        isCompleted: isRouteComplete,
        isCurrentStop: !isRouteComplete && allStopsCompleted,
        customerName: customer.name,
        customerPhone: customer.phone,
        latitude: endAddressObj?.latitude,
        longitude: endAddressObj?.longitude,
      });
    }

    return tasks;
  }, [stops, currentStop, routeStartAddress, routeEndAddress, routeStartOriginalTripId, routeEndOriginalTripId, routeStatus]);

  const currentTask = useMemo(() => {
    return taskList.find((task) => task.isCurrentStop) || taskList.find((task) => !task.isCompleted);
  }, [taskList]);

  const tripGroups: TripGroup[] = useMemo(() => {
    const groups: { [key: string]: Stop[] } = {};

    // Add route start to its original trip if it has an originalTripId
    if (routeStartAddress && routeStartOriginalTripId) {
      if (!groups[routeStartOriginalTripId]) {
        groups[routeStartOriginalTripId] = [];
      }
      groups[routeStartOriginalTripId].push({
        latitude: startAddressObj?.latitude || "",
        longitude: startAddressObj?.longitude || "",
        address: routeStartAddress,
        tripId: routeStartOriginalTripId,
        pointType: "start",
        originalTripId: routeStartOriginalTripId,
      });
    }

    // Add all regular stops
    stops.forEach((stop) => {
      if (!groups[stop.tripId]) {
        groups[stop.tripId] = [];
      }
      groups[stop.tripId].push(stop);
    });

    // Add route end to its original trip if it has an originalTripId
    if (routeEndAddress && routeEndOriginalTripId) {
      if (!groups[routeEndOriginalTripId]) {
        groups[routeEndOriginalTripId] = [];
      }
      groups[routeEndOriginalTripId].push({
        latitude: endAddressObj?.latitude || "",
        longitude: endAddressObj?.longitude || "",
        address: routeEndAddress,
        tripId: routeEndOriginalTripId,
        pointType: "end",
        originalTripId: routeEndOriginalTripId,
      });
    }

    return childTrips.map((tripId) => ({
      tripId,
      stops: groups[tripId] || [],
    }));
  }, [stops, childTrips, routeStartAddress, routeStartOriginalTripId, routeEndAddress, routeEndOriginalTripId, startAddressObj, endAddressObj]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (address: string, lat?: string, lng?: string) => {
    if (lat && lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  const handleMarkComplete = (task: TaskItem) => {
    setSelectedTask(task);
    setCompleteModalVisible(true);
  };

  const handleCloseModal = () => {
    setCompleteModalVisible(false);
    setSelectedTask(null);
  };

  const handleOpenDetails = (task: TaskItem) => {
    setSelectedTask(task);
    setDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedTask(null);
  };

  const handleMarkCompleteFromDetails = () => {
    // Close the details modal and open the complete modal
    setDetailsModalVisible(false);
    setCompleteModalVisible(true);
  };

  const handleOpenTripDetails = (tripId: string) => {
    setSelectedTripId(tripId);
    setTripDetailsModalVisible(true);
  };

  const handleCloseTripDetailsModal = () => {
    setTripDetailsModalVisible(false);
    setSelectedTripId(null);
  };

  const handleMarkCompleteFromTripDetails = (pointType: "start" | "end") => {
    if (!selectedTripId) return;

    // Find the task from taskList that matches this trip and pointType
    const task = taskList.find(
      (t) => (t.tripId === selectedTripId || t.originalTripId === selectedTripId) &&
             (t.pointType === pointType || (pointType === "start" && t.pointType === "route_start") || (pointType === "end" && t.pointType === "route_end"))
    );

    if (task) {
      setSelectedTask(task);
      setTripDetailsModalVisible(false);
      setCompleteModalVisible(true);
    }
  };

  // Get trip details for the TripDetailsModal
  const getSelectedTripDetails = () => {
    if (!selectedTripId) return { pickup: null, drop: null };

    // Find pickup and drop stops for this trip
    const tripStops = taskList.filter(
      (t) => t.tripId === selectedTripId || t.originalTripId === selectedTripId
    );

    const pickup = tripStops.find(
      (t) => t.pointType === "start" || t.pointType === "route_start"
    );
    const drop = tripStops.find(
      (t) => t.pointType === "end" || t.pointType === "route_end"
    );

    return {
      pickup: pickup ? {
        address: pickup.address,
        fullAddress: pickup.fullAddress,
        customerName: pickup.customerName,
        customerPhone: pickup.customerPhone,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        isCompleted: pickup.isCompleted,
        isCurrentStop: pickup.isCurrentStop,
        pointType: "start" as const,
      } : null,
      drop: drop ? {
        address: drop.address,
        fullAddress: drop.fullAddress,
        customerName: drop.customerName,
        customerPhone: drop.customerPhone,
        latitude: drop.latitude,
        longitude: drop.longitude,
        isCompleted: drop.isCompleted,
        isCurrentStop: drop.isCurrentStop,
        pointType: "end" as const,
      } : null,
    };
  };

  const getDeliveryImages = (tripId: string) => {
    const trip = user?.trips?.find((t: any) => t.id === tripId);
    return trip?.deliveryDetails?.images || [];
  };

  const getRealImages = (tripId: string) => {
    const trip = user?.trips?.find((t: any) => t.id === tripId);
    return trip?.deliveryDetails?.realimages || [];
  };

  const handleSubmitComplete = async (data: {
    routeId: string;
    tripId: string;
    originalTripId?: string;
    pointType: string;
    otp: string;
    parcelImage?: string | null;
  }) => {
    try {
      const response = await backendService.completeRoutePoint(data);

      if (response.routeEnded) {
        showSuccessToast("Route completed successfully!");
        // Refresh user data to get updated route info
        fetchUser();
        // Navigate back since route is complete
        navigation.goBack();
      } else {
        showSuccessToast("Stop completed successfully!");
        // Refresh user data and navigate back to home
        fetchUser();
        navigation.goBack();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to complete stop";
      showErrorToast(errorMessage);
    }
  };

  const getTripIdShort = (tripId: string, originalTripId?: string) => {
    const idToUse = originalTripId || tripId;
    return idToUse?.slice(-4)?.toUpperCase() || "----";
  };

  const renderTaskView = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      {/* Show status message based on route status */}
      {routeStatus === "Complete" && (
        <View style={styles.statusMessageContainer}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#38AD51" />
          <Text style={styles.statusMessageText}>All stops are completed</Text>
        </View>
      )}
      {routeStatus !== "In Progress" && routeStatus !== "Complete" && (
        <View style={styles.statusMessageContainer}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#8C8C8C" />
          <Text style={styles.statusMessageText}>No stops completed yet</Text>
        </View>
      )}

      {taskList.map((task, index) => {
        const isActive = task.isCurrentStop;
        const isLastItem = index === taskList.length - 1;
        const prevTask = taskList[index - 1];
        const isPrevCompleted = prevTask?.isCompleted;
        const nextTask = taskList[index + 1];

        // Determine line style based on task states
        const getTopLineStyle = () => {
          if (isPrevCompleted && task.isCompleted) {
            return styles.timelineLineSolidGreen;
          }
          if (isPrevCompleted && isActive) {
            return styles.timelineLineSolidGreen;
          }
          return styles.timelineLineDashedGray;
        };

        const getBottomLineStyle = () => {
          if (task.isCompleted && nextTask?.isCompleted) {
            return styles.timelineLineSolidGreen;
          }
          if (task.isCompleted && nextTask?.isCurrentStop) {
            return styles.timelineLineSolidGreen;
          }
          if (isActive || task.isCompleted) {
            return styles.timelineLineDashedGreen;
          }
          return styles.timelineLineDashedGray;
        };

        return (
          <View key={`${task.tripId}-${task.pointType}-${index}`}>
            <View style={styles.taskRow}>
              {/* Timeline */}
              <View style={styles.timelineContainer}>
                {/* Line above circle */}
                {index > 0 && (
                  <View style={[styles.timelineLineTop, getTopLineStyle()]} />
                )}
                {/* Circle */}
                <View
                  style={[
                    styles.timelineCircle,
                    task.isCompleted && styles.timelineCircleCompleted,
                    isActive && !task.isCompleted && styles.timelineCircleActive,
                  ]}
                >
                  {task.isCompleted && (
                    <MaterialCommunityIcons name="check" size={14} color="#38AD51" />
                  )}
                </View>
                {/* Line below circle - only show if not last item AND no expanded card */}
                {!isLastItem && !isActive && (
                  <View style={[styles.timelineLineBottom, getBottomLineStyle()]} />
                )}
              </View>

              {/* Task Content */}
              <TouchableOpacity
                style={styles.taskContent}
                activeOpacity={0.7}
                onPress={() => handleOpenDetails(task)}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskHeaderLeft}>
                    <Text style={styles.taskAddress} numberOfLines={1}>
                      {task.fullAddress}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#262626" />
                </View>
                {/* Show meta for regular stops, or route points that have originalTripId */}
                {(!task.isRoutePoint || task.originalTripId) && (
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskTripId}>T:{getTripIdShort(task.tripId, task.originalTripId)}</Text>
                    {/* Show badge for regular stops or route_start (Pickup) */}
                    {(task.pointType === "start" || task.pointType === "end" || task.pointType === "route_start") && (
                      <View
                        style={[
                          styles.taskTypeBadge,
                          (task.pointType === "start" || task.pointType === "route_start") ? styles.pickupBadge : styles.dropBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.taskTypeText,
                            (task.pointType === "start" || task.pointType === "route_start") ? styles.pickupText : styles.dropText,
                          ]}
                        >
                          {(task.pointType === "start" || task.pointType === "route_start") ? "Pickup" : "Drop"}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Expanded Action Card - shown below the current active task only when route is In Progress */}
            {isActive && !task.isRoutePoint && routeStatus === "In Progress" && (
              <View style={styles.expandedCardWrapper}>
                <View style={styles.expandedCard}>
                  <View style={styles.customerRow}>
                    <Text style={styles.customerName}>{task.customerName}</Text>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleCall(task.customerPhone || "")}
                    >
                      <PhoneCircle size={24} color="#0659AC" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.markCompleteButton}
                      onPress={() => handleMarkComplete(task)}
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
                      onPress={() => {
                        const stop = stops.find(
                          (s) => s.tripId === task.tripId && s.pointType === task.pointType
                        );
                        handleDirections(task.fullAddress, stop?.latitude, stop?.longitude);
                      }}
                    >
                      <MaterialCommunityIcons name="navigation-variant" size={16} color="#fff" />
                      <Text style={styles.directionsText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      })}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderTripView = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      {/* Show status message based on route status */}
      {routeStatus === "Complete" && (
        <View style={styles.statusMessageContainer}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#38AD51" />
          <Text style={styles.statusMessageText}>All stops are completed</Text>
        </View>
      )}
      {routeStatus !== "In Progress" && routeStatus !== "Complete" && (
        <View style={styles.statusMessageContainer}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#8C8C8C" />
          <Text style={styles.statusMessageText}>No stops completed yet</Text>
        </View>
      )}

      {/* Show Next Task card only when route is In Progress */}
      {routeStatus === "In Progress" && currentTask && (
        <View style={styles.nextTaskSection}>
          <Text style={styles.sectionLabel}>Next Task</Text>
          <View style={styles.nextTaskCard}>
            <View style={styles.customerRow}>
              <Text style={styles.customerName}>{currentTask.customerName}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(currentTask.customerPhone || "")}
              >
                <PhoneCircle size={24} color="#0659AC" />
              </TouchableOpacity>
            </View>
            <View style={styles.cardDivider} />
            <Text style={styles.nextTaskFullAddress} numberOfLines={1}>
              {currentTask.fullAddress}
            </Text>
            <View style={styles.taskMeta}>
              <Text style={styles.taskTripId}>T:{getTripIdShort(currentTask.tripId, currentTask.originalTripId)}</Text>
              <View
                style={[
                  styles.taskTypeBadge,
                  (currentTask.pointType === "start" || currentTask.pointType === "route_start") ? styles.pickupBadge : styles.dropBadge,
                ]}
              >
                <Text
                  style={[
                    styles.taskTypeText,
                    (currentTask.pointType === "start" || currentTask.pointType === "route_start") ? styles.pickupText : styles.dropText,
                  ]}
                >
                  {(currentTask.pointType === "start" || currentTask.pointType === "route_start") ? "Pickup" : "Drop"}
                </Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.markCompleteButton} onPress={() => handleMarkComplete(currentTask)}>
                <MaterialCommunityIcons name="check-circle-outline" size={16} color="#0873DE" />
                <Text style={styles.markCompleteText}>Mark Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => {
                  const stop = stops.find(
                    (s) => s.tripId === currentTask.tripId && s.pointType === currentTask.pointType
                  );
                  handleDirections(currentTask.fullAddress, stop?.latitude, stop?.longitude);
                }}
              >
                <MaterialCommunityIcons name="navigation-variant" size={16} color="#fff" />
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.sectionLabel}>All Trips</Text>

      {tripGroups.map((group) => {
        const tripShortId = getTripIdShort(group.tripId);

        return (
          <TouchableOpacity
            key={group.tripId}
            style={styles.tripCard}
            activeOpacity={0.7}
            onPress={() => handleOpenTripDetails(group.tripId)}
          >
            <View style={styles.tripCardHeader}>
              <Text style={styles.tripCardId}>T:{tripShortId}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#262626" />
            </View>
            {group.stops.map((stop, stopIndex) => {
              // Find the global index of this stop in the stops array
              const globalStopIndex = stops.findIndex(
                (s) => s.tripId === stop.tripId && s.pointType === stop.pointType
              );

              // Determine if this stop is completed
              let isCompleted = false;

              // If route is complete, all stops are completed
              if (routeStatus === "Complete") {
                isCompleted = true;
              } else if (globalStopIndex !== -1) {
                // Regular stop from stops array
                isCompleted = isStopCompleted(stop, globalStopIndex);
              } else {
                // This is a route start or end address added to tripGroups
                // Check if it matches the route's start or end address
                const isRouteStart = stop.tripId === routeStartOriginalTripId && stop.pointType === "start";
                const isRouteEnd = stop.tripId === routeEndOriginalTripId && stop.pointType === "end";

                if (isRouteStart) {
                  // Route start is completed if currentStop exists (we've moved past start)
                  isCompleted = !!currentStop?.tripId;
                } else if (isRouteEnd) {
                  // Route end is completed only if currentStop matches the end address
                  isCompleted = currentStop?.tripId === routeEndOriginalTripId && currentStop?.pointType === "end";
                }
              }
              const isLastStop = stopIndex === group.stops.length - 1;

              return (
                <View
                  key={`${stop.tripId}-${stop.pointType}`}
                  style={styles.tripStopRow}
                >
                  <View style={styles.tripStopIndicator}>
                    {stopIndex > 0 && (
                      <View
                        style={[
                          styles.tripStopLine,
                          isCompleted ? styles.tripStopLineCompleted : styles.tripStopLineDefault,
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.tripStopDot,
                        isCompleted && styles.tripStopDotCompleted,
                      ]}
                    >
                      {isCompleted && (
                        <MaterialCommunityIcons name="check" size={10} color="#38AD51" />
                      )}
                    </View>
                    {!isLastStop && (
                      <View
                        style={[
                          styles.tripStopLineBottom,
                          isCompleted ? styles.tripStopLineCompleted : styles.tripStopLineDefault,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.tripStopContent}>
                    <Text style={styles.tripStopAddress} numberOfLines={1}>
                      {stop.address}
                    </Text>
                    <View style={styles.tripStopMeta}>
                      <View
                        style={[
                          styles.taskTypeBadge,
                          stop.pointType === "start" ? styles.pickupBadge : styles.dropBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.taskTypeText,
                            stop.pointType === "start" ? styles.pickupText : styles.dropText,
                          ]}
                        >
                          {stop.pointType === "start" ? "Pickup" : "Drop"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </TouchableOpacity>
        );
      })}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route ID : R{routeId}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "task" && styles.tabActive]}
          onPress={() => setActiveTab("task")}
        >
          <Text style={[styles.tabText, activeTab === "task" && styles.tabTextActive]}>
            Task View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "trip" && styles.tabActive]}
          onPress={() => setActiveTab("trip")}
        >
          <Text style={[styles.tabText, activeTab === "trip" && styles.tabTextActive]}>
            Trip View
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "task" ? renderTaskView() : renderTripView()}

      {/* Complete Modal */}
      <CompleteStopModal
        visible={completeModalVisible}
        onClose={handleCloseModal}
        task={selectedTask}
        routeId={routeData?.id}
        deliveryImages={getDeliveryImages(selectedTask?.originalTripId || selectedTask?.tripId || "")}
        realImages={getRealImages(selectedTask?.originalTripId || selectedTask?.tripId || "")}
        onSubmit={handleSubmitComplete}
      />

      {/* Stop Details Modal */}
      <StopDetailsModal
        visible={detailsModalVisible}
        onClose={handleCloseDetailsModal}
        task={selectedTask}
        deliveryImages={getDeliveryImages(selectedTask?.originalTripId || selectedTask?.tripId || "")}
        realImages={getRealImages(selectedTask?.originalTripId || selectedTask?.tripId || "")}
        onMarkComplete={handleMarkCompleteFromDetails}
        showMarkComplete={routeStatus === "In Progress" && selectedTask?.isCurrentStop === true}
      />

      {/* Trip Details Modal */}
      <TripDetailsModal
        visible={tripDetailsModalVisible}
        onClose={handleCloseTripDetailsModal}
        tripId={selectedTripId || ""}
        pickup={getSelectedTripDetails().pickup}
        drop={getSelectedTripDetails().drop}
        deliveryImages={getDeliveryImages(selectedTripId || "")}
        realImages={getRealImages(selectedTripId || "")}
        onMarkComplete={handleMarkCompleteFromTripDetails}
        showPickupMarkComplete={routeStatus === "In Progress" && getSelectedTripDetails().pickup?.isCurrentStop === true}
        showDropMarkComplete={routeStatus === "In Progress" && getSelectedTripDetails().drop?.isCurrentStop === true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#E8E8E8",
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#4285F4",
    fontWeight: "600",
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  timelineContainer: {
    width: 24,
    alignItems: "center",
  },
  timelineLineTop: {
    width: 2,
    height: 24,
  },
  timelineLineBottom: {
    width: 2,
    flex: 1,
    minHeight: 44,
  },
  timelineLineExpanded: {
    width: 2,
    height: "100%",
  },
  timelineLineSolid: {
    backgroundColor: "#38AD51",
  },
  timelineLineSolidGreen: {
    backgroundColor: "#38AD51",
    borderStyle: undefined,
    borderLeftWidth: 0,
  },
  timelineLineDashedGreen: {
    backgroundColor: "transparent",
    borderLeftWidth: 2,
    borderLeftColor: "#38AD51",
    borderStyle: "dashed",
  },
  timelineLineDashedGray: {
    backgroundColor: "transparent",
    borderLeftWidth: 1,
    borderLeftColor: "#D9D9D9",
    borderStyle: "dashed",
  },
  timelineLineDotted: {
    backgroundColor: "transparent",
    borderLeftWidth: 2,
    borderLeftColor: "#38AD51",
    borderStyle: "dashed",
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCircleCompleted: {
    backgroundColor: "#C5ECCD",
    borderColor: "#C5ECCD",
  },
  timelineCircleActive: {
    borderColor: "#38AD51",
    borderWidth: 1,
    backgroundColor: "#fff",
    shadowColor: "#38AD51",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  taskContent: {
    flex: 1,
    paddingBottom: 24,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  taskHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  taskAddress: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  taskFullAddress: {
    fontSize: 12,
    color: "#A6A6A6",
    marginTop: 0,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  taskTripId: {
    fontSize: 12,
    color: "#8C8C8C",
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  taskTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 40,
  },
  pickupBadge: {
    backgroundColor: "#E6F2FE",
  },
  dropBadge: {
    backgroundColor: "#FEF0E7",
  },
  taskTypeText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  pickupText: {
    color: "#0659AC",
  },
  dropText: {
    color: "#AB4A07",
  },
  expandedCardWrapper: {
    marginLeft: 32,
    marginBottom: 16,
  },
  expandedCard: {
    backgroundColor: "#E6F2FE",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#0873DE",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    marginVertical: 12,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#262626",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  callButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
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
    gap: 8,
  },
  markCompleteText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0873DE",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  directionsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0873DE",
    gap: 8,
  },
  directionsText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  nextTaskSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#8C8C8C",
    marginBottom: 12,
  },
  nextTaskCard: {
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#0873DE",
  },
  nextTaskFullAddress: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    lineHeight: 20,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tripCardId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  tripStopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  tripStopIndicator: {
    width: 24,
    alignItems: "center",
  },
  tripStopLine: {
    width: 2,
    height: 16,
    position: "absolute",
    top: -16,
  },
  tripStopLineBottom: {
    width: 2,
    flex: 1,
    minHeight: 16,
  },
  tripStopLineCompleted: {
    backgroundColor: "#38AD51",
  },
  tripStopLineDefault: {
    backgroundColor: "#D9D9D9",
  },
  tripStopDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  tripStopDotCompleted: {
    backgroundColor: "#C5ECCD",
    borderColor: "#C5ECCD",
  },
  tripStopContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  tripStopAddress: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
  },
  tripStopMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  bottomPadding: {
    height: 100,
  },
  statusMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  statusMessageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
  },
});

export default RouteDetails;
