import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../store/user.store';
import { fetchOrganisationLogo } from '../../services/api/auth.service';

const Header = () => {
  const organisationId = useUserStore((state) => state.organisationId);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (organisationId) {
      setLoading(true);
      fetchOrganisationLogo(organisationId)
        .then((uri) => {
          if (isMounted) setLogoUri(uri);
        })
        .catch(() => {
          if (isMounted) setLogoUri(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLogoUri(null);
    }
    return () => { isMounted = false; };
  }, [organisationId]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.left}>
        {loading ? (
          <ActivityIndicator size={24} color="#00994C" style={styles.logo} />
        ) : logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logo} />
        ) : (
          <Image source={require('../../../assets/roqit.png')} style={styles.logo} />
        )}
      </View>
      {/* <TouchableOpacity style={styles.iconButton}>
        <Icon name="bell-outline" size={26} color="#00994C" />
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 12,
    // backgroundColor: '#fff',
    // borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 108,
    height: 36,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00994C',
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 11,
    color: '#00994C',
    marginTop: -2,
  },
  iconButton: {
    padding: 6,
  },
});

export default Header; 