import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RoqButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  iconName?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
}

const RoqButton: React.FC<RoqButtonProps> = ({
  title,
  onPress,
  iconName,
  loading = false,
  disabled = false,
  style = {},
}) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <View style={styles.content}>
        {iconName && <Icon name={iconName} size={20} color="#fff" style={styles.icon} />}
        <Text style={styles.text}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1565c0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    backgroundColor: '#90caf9',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RoqButton; 