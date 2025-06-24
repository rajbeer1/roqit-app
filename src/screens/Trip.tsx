import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/ui/Header';

const Trip = () => (
  <View style={styles.container}>
    <Header />
    <View style={styles.content}>
      <Text style={styles.text}>Trip Page</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
});

export default Trip; 