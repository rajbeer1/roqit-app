import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { storageService } from '../services/api/storage.service';

const Home = () => {
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const token = await storageService.getItem('token');
      if (!token) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    })();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
});

export default Home; 