import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SalesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sales Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#f1f5f9',
    fontSize: 18,
  },
});

export default SalesScreen;
