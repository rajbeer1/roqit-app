import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import KeyboardWrapper from "./Keyboard";
import { showErrorToast } from "../../services/ui/toasts";
interface OrderDataModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (orders: any, paymentAmount: string) => void;
  loading?: boolean;
}

const OrderDataModal: React.FC<OrderDataModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [orders, setOrders] = useState({
    collected: "",
    delivered: "",
    failed: "",
    returned: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleConfirm = () => {
    if (
      !orders.collected ||
      !orders.delivered ||
      !orders.failed ||
      !orders.returned ||
      !paymentAmount
    ) {
      showErrorToast("Please fill all required fields");
      return;
    }
    onConfirm(orders, paymentAmount);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <KeyboardWrapper style={styles.modalContainer}>
          <View style={styles.dragBar} />
          <Text style={styles.title}>Delivery Records</Text>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Orders Collected<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={orders.collected}
                onChangeText={(text) =>
                  setOrders((prev) => ({ ...prev, collected: text }))
                }
                placeholder="00"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                maxLength={5}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Orders Delivered<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={orders.delivered}
                onChangeText={(text) =>
                  setOrders((prev) => ({ ...prev, delivered: text }))
                }
                placeholder="00"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                maxLength={5}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Orders Failed to Deliver<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={orders.failed}
                onChangeText={(text) =>
                  setOrders((prev) => ({ ...prev, failed: text }))
                }
                placeholder="00"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                maxLength={5}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Orders Returned<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={orders.returned}
                onChangeText={(text) =>
                  setOrders((prev) => ({ ...prev, returned: text }))
                }
                placeholder="00"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                maxLength={5}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Cash Collected<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.inputCash]}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="₹ 00.00"
                keyboardType="numeric"
                placeholderTextColor="#bbb"
                maxLength={10}
              />
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              !orders.collected ||
              !orders.delivered ||
              !orders.failed ||
              !orders.returned ||
              !paymentAmount ||
              loading
                ? { opacity: 0.5 }
                : {},
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={
              !orders.collected ||
              !orders.delivered ||
              !orders.failed ||
              !orders.returned ||
              !paymentAmount ||
              loading
            }
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <Text style={styles.cloudIcon}>☁️</Text>
              )}
              <Text style={styles.checkoutButtonText}>
                {loading ? "Processing..." : "Check out"}
              </Text>
            </View>
          </TouchableOpacity>
        </KeyboardWrapper>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    height: "70%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "stretch",
    maxWidth: 420,
  },
  dragBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#222",
    marginBottom: 6,
  },
  required: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 12,
    backgroundColor: "#fafbfc",
    color: "#222",
  },
  inputCash: {
    fontSize: 12,
    paddingLeft: 16,
  },
  checkoutButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 2,
    shadowColor: "#1a73e8",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cloudIcon: {
    fontSize: 22,
    marginRight: 8,
    color: "#fff",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
});

export default OrderDataModal;
