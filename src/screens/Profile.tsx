import React, { useState, useEffect } from "react";
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

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.avatarWrapper}>
          {imgLoading ? (
            <ActivityIndicator
              size={36}
              color="#111"
              style={styles.avatarImg}
            />
          ) : driverImg ? (
            <Image source={{ uri: driverImg }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar} />
          )}
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.role}>{"Driver"}</Text>
        <Text style={styles.since}>
          Since {user.dateOfJoining || user.createdAt}
        </Text>

        <Text style={styles.labelSection}>Account</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{user.gender}</Text>
          </View>
        </View>

        <Text style={styles.labelSection}>Contact</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mobile</Text>
            <Text style={styles.value}>{user.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Permanent Address</Text>
            <Text style={styles.value}>{user.permanentAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mailing Address</Text>
            <Text style={styles.value}>{user.mailingAddress}</Text>
          </View>
        </View>

        <Text style={styles.labelSection}>More</Text>
        <View style={styles.infoBox}>
          <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
            <View style={styles.signOutIcon}>
              <Text style={{ fontSize: 18 }}>⏎</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
    color: "#222",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 8,
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
    marginBottom: 8,
    resizeMode: "cover",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
  },
  role: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 2,
  },
  since: {
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 12,
  },
  labelSection: {
    fontSize: 13,
    color: "#888",
    marginTop: 18,
    marginBottom: 4,
    fontWeight: "500",
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: "#888",
    maxWidth: 180,
    textAlign: "right",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: -12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  actionText: {
    fontSize: 16,
    color: "#222",
  },
  arrow: {
    fontSize: 18,
    color: "#bbb",
    fontWeight: "bold",
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    // borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  signOutText: {
    fontSize: 16,
    color: "#e53935",
    fontWeight: "600",
  },
  signOutIcon: {
    borderWidth: 1.5,
    borderColor: "#e53935",
    borderRadius: 6,
    padding: 2,
    marginLeft: 8,
  },
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
