import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Header from "../components/ui/Header";
import { useUserStore } from "../store/user.store";
import { useAuthStore } from "../store/auth.store";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { fetchDriverImage } from "../services/api/backend.service";

const Profile = () => {
  const { user, organisationId } = useUserStore();
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [driverImg, setDriverImg] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user?.id && organisationId) {
      setImgLoading(true);
      fetchDriverImage(organisationId, user.id)
        .then((uri) => {
          if (isMounted && uri) setDriverImg(uri);
        })
        .catch(() => {
          if (isMounted) setDriverImg(null);
        })
        .finally(() => {
          if (isMounted) setImgLoading(false);
        });
    } else {
      setDriverImg(null);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, organisationId]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text>Loading user...</Text>
        </View>
      </View>
    );
  }

  const handleSignOut = () => {
    setModalVisible(true);
  };

  const confirmSignOut = () => {
    setModalVisible(false);
    logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  const formatHours = (value?: number | null) => {
    if (value === null || value === undefined || isNaN(Number(value))) return "0 Hrs";
    const n = Number(value);
    const hours = n > 500 ? Math.round(n / 60) : Math.round(n);
    return `${hours} Hrs`;
  };

  const sinceDate=user?.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "--";
  const loginTimeText = formatHours(user.totalCheckinTime as number);
  const driveTimeText = formatHours(user.totalDriveTime as number);
  const distanceText = `${Math.round(Number(user.totalDistance || 0))} Kms`;
  const safetyPercent = Math.max(0, Math.min(100, Number(user?.safetyScore ?? 0)));

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 95 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            {imgLoading ? (
              <ActivityIndicator size={36} color="#111" style={styles.avatarImg} />
            ) : driverImg ? (
              <Image source={{ uri: driverImg }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.sinceText}>Since {sinceDate}</Text>
            </View>
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactValueSmall}>{user.phoneNumber || "--"}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactValueSmall}>{user.email || "--"}</Text>
          </View>
          <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={styles.contactValueSmall}>{user.mailingAddress?.slice(0, 40) || user.permanentAddress?.slice(0, 40) || user.city || "--"}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>My Stats</Text>
          <View style={styles.scoreWrap}>
            <View style={styles.scoreCircleOuter}>
              <View
                style={[
                  styles.scoreFill,
                  { width: 200 * (safetyPercent / 100) },
                ]}
              />
              <View style={styles.scoreCircleInner}>
                <Text style={styles.scoreValue}>{user?.safetyScore? Number(user.safetyScore).toFixed(0) : "N/A"}%</Text>
                <Text style={styles.scoreLabel}>My Score</Text>
              </View>
            </View>
          </View>
          <View style={styles.miniStatsRow}>
            <View style={styles.miniStatBox}>
              <View style={styles.miniIconWrap}><Text style={styles.miniIcon}>⏱️</Text></View>
              <Text style={styles.miniValue}>{loginTimeText}</Text>
              <Text style={styles.miniLabel}>Total Login Time</Text>
            </View>
            <View style={styles.miniStatBox}>
              <View style={styles.miniIconWrap}><Text style={styles.miniIcon}>🛞</Text></View>
              <Text style={styles.miniValue}>{driveTimeText}</Text>
              <Text style={styles.miniLabel}>Total Drive Time</Text>
            </View>
            <View style={styles.miniStatBox}>
              <View style={styles.miniIconWrap}><Text style={styles.miniIcon}>🧭</Text></View>
              <Text style={styles.miniValue}>{distanceText}</Text>
              <Text style={styles.miniLabel}>Total Distance</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity >
            <Text style={styles.deactivate}>Deactivate Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Confirm sign out?</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.noButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.noButtonText}>No</Text>
              </Pressable>
              <Pressable style={styles.yesButton} onPress={confirmSignOut}>
                <Text style={styles.yesButtonText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8f9",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: "#e9f2ff",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginBottom: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "black",
    marginBottom: 8,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 0,
    resizeMode: "cover",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  sinceText: {
    fontSize: 12,
    color: "#445",
    marginTop: 4,
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#d5e5ff",
    marginVertical: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  contactIcon: { fontSize: 16, width: 24 },
  contactValue: { fontSize: 15, color: "#222" },
  contactValueSmall: { fontSize: 13.5, color: "#222" },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  scoreWrap: { alignItems: "center", marginVertical: 8 },
  scoreCircleOuter: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: "#e9edf2",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  scoreFill: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 100,
    backgroundColor: "#4caf50",
    zIndex: 1,
  },
  scoreCircleInner: {
    width: 180,
    height: 90,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  scoreValue: { fontSize: 28, fontWeight: "700", color: "#0d47a1" },
  scoreLabel: { fontSize: 14, color: "#667" },
  miniStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  miniStatBox: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 6,
    alignItems: "center",
  },
  miniIconWrap: {
    backgroundColor: "#eaf2ff",
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  miniIcon: { fontSize: 20 },
  miniValue: { fontSize: 16, fontWeight: "700", color: "#0d47a1" },
  miniLabel: { fontSize: 10, color: "#667", marginTop: 2 },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f2d7d7",
    width: 180,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: "#e53935", fontSize: 16, fontWeight: "600" },
  deactivate: { marginTop: 16, color: "#d32f2f", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalText: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 24,
    color: "#222",
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  noButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#bdbdbd",
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  yesButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    marginLeft: 8,
    alignItems: "center",
    backgroundColor: "#e53935",
  },
  noButtonText: {
    fontSize: 18,
    color: "#222",
    fontWeight: "500",
  },
  yesButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});

export default Profile;
