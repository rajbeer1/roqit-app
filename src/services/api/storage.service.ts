import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  setItem: async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      throw e;
    }
  },

  getItem: async <T = any>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      throw e;
    }
  },

  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      throw e;
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      throw e;
    }
  },
}; 