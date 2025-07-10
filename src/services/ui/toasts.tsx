import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

const CustomErrorToast = ({ text2, props }: any) => (
  <View style={styles.modalContainer}>
    <View style={styles.iconContainer}>
      <View style={styles.circleError}>
        <Text style={styles.xText}>×</Text>
      </View>
    </View>
    <Text style={styles.errorMessage}>{text2 || "Something went wrong"}</Text>
    {props?.onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={props.onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

const CustomSuccessToast = ({ text2 }: any) => (
  <View style={styles.modalContainer}>
    <View style={styles.iconContainer}>
      <View style={styles.circleSuccess}>
        <Text style={styles.checkText}>✓</Text>
      </View>
    </View>
    <Text style={styles.successMessage}>{text2 || "Success!"}</Text>
  </View>
);

export const toastConfig = {
  error: (props: any) => <CustomErrorToast {...props} />,
};

export const showErrorToast = (message: string, onRetry?: () => void) => {
  Toast.show({
    type: "error",
    text2: message || "Something went wrong",
    position: "bottom",
    autoHide: true,
    visibilityTime: 10000,
    props: { onRetry },
  });
};

export const showSuccessToast = (message: string) => {
  Toast.show({
    type: "success",
    text2: message || "Success!",
    position: "top",
    visibilityTime: 5000,
    autoHide: true,
  });
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 260,
    minHeight: 180,
  },
  iconContainer: {
    marginBottom: 16,
  },
  circleError: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
  },
  circleSuccess: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#43a047",
    alignItems: "center",
    justifyContent: "center",
  },
  xText: {
    color: "#e53935",
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 40,
  },
  checkText: {
    color: "#43a047",
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 40,
  },
  errorMessage: {
    fontSize: 17,
    color: "#222",
    marginBottom: 24,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 17,
    color: "#222",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
