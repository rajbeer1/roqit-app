import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface KeyboardWrapperProps {
  children: ReactNode;
  style?: object;
}

const KeyboardWrapper: React.FC<KeyboardWrapperProps> = ({ children, style }) => (
  <SafeAreaView style={[styles.safeArea, style]}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.flex}>{children}</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
});

export default KeyboardWrapper;