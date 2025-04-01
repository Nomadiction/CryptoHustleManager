import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PortfolioScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ваш криптовалютный портфель</Text>
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

export default PortfolioScreen;
