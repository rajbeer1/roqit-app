import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { storageService } from '../services/api/storage.service';
import Header from '../components/ui/Header';
import { useUserStore } from '../store/user.store';

const Home = () => {
  const navigation = useNavigation();
  const {fetchUser,organisationId,user,operationLat,operationLng,inProgressTrip} = useUserStore();
  const loading = useUserStore((state) => state.loading);

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
      } else {
        fetchUser();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1565c0" />
        ) : (
          <Text style={styles.text}>Home Page</Text>
        )}
      </View>
    </View>
  );
};

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

export default Home; 