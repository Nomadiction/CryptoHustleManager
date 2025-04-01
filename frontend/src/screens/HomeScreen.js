import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Добро пожаловать в CryptoHustleManager!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#112a57",
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
  },
});

export default HomeScreen;
