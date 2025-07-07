import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import { MaterialIcons } from "@expo/vector-icons";

const ImageSelector = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleCamera = () => {
    navigation.navigate("Sixth", { source: "camera" });
  };

  const handleBrowse = () => {
    navigation.navigate("Sixth", { source: "browse" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="cloud" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>You need to upload your</Text>
        <Text style={styles.highlight}>Documents & Click Selfie</Text>
        <Text style={styles.description}>
          Please upload a clear image of your document like, PAN card, Aadhaar
          card and driving license. Make sure the details are visible and not
          blurred or cropped.
        </Text>
        <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
          <View style={styles.cameraButtonTextContainer}>
            <MaterialIcons name="camera" size={24} color="#fff" />
            <Text style={styles.cameraButtonText}>Use Camera</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomSection}>
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.separator} />
        </View>
        <TouchableOpacity style={styles.browseButton} onPress={handleBrowse}>
          <View style={styles.browseButtonTextContainer}>
            <MaterialIcons name="image" size={40} color="#1976d2" />
            <View>
              <Text style={styles.browseButtonText}>Select from Gallery</Text>
              <Text style={styles.fileTypeText}>PNG, JPEG only</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  topSection: {
    alignItems: "center",
    paddingTop: 120,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 32,
  },
  browseButtonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cameraButtonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconContainer: {
    backgroundColor: "#1976d2",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  cloudIcon: {
    width: 48,
    height: 48,
    tintColor: "#fff",
  },
  title: {
    fontSize: 16,
    color: "#222",
    marginBottom: 4,
    textAlign: "center",
  },
  highlight: {
    fontSize: 20,
    color: "#1976d2",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  cameraButton: {
    backgroundColor: "#1976d2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#faf7f2",
    paddingTop: 32,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  orText: {
    color: "#888",
    fontSize: 14,
  },
  browseButton: {
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "flex-start",
    backgroundColor: "#fff",
    width: 300,
  },
  browseButtonText: {
    color: "#1976d2",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  fileTypeText: {
    color: "#888",
    fontSize: 12,
  },
});

export default ImageSelector;
