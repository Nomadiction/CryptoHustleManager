import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const LOCALHOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

const testServerReachable = async (url) => {
  try {
    const res = await fetch(`${url}/api/config`);
    return res.ok;
  } catch {
    return false;
  }
};

export const getBaseUrl = async () => {
  try {
    const storedIp = await AsyncStorage.getItem("server_ip");
    if (storedIp && await testServerReachable(`http://${storedIp}:5000`)) {
      return `http://${storedIp}:5000`;
    }

    const res = await fetch(`http://${LOCALHOST}:5000/api/config`);
    const data = await res.json();
    const url = new URL(data.apiUrl);
    const ip = url.hostname;

    if (ip && await testServerReachable(`http://${ip}:5000`)) {
      await AsyncStorage.setItem("server_ip", ip);
      return `http://${ip}:5000`;
    }

    return null;
  } catch (err) {
    console.error("Ошибка получения IP:", err);
    return null;
  }
};
