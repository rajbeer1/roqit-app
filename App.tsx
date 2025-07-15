import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { toastConfig } from "./src/services/ui/toasts";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { storageService } from "./src/services/api/storage.service";
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The app encountered an unexpected error. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorDetailsTitle}>Error Details (Development):</Text>
              <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text style={styles.errorText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.restartButton} onPress={this.handleRestart}>
            <Text style={styles.restartButtonText}>Restart App</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxHeight: 200,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  restartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function App() {
// (async () => {
//   const token = await storageService.clear();

// })();
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

