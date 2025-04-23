import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "expo-constants";

export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    const fetchCrypto = async () => {
      if (!apiUrl) {
        console.error("❌ API URL не задан в extra.API_URL");
        setError("API URL не найден в конфигурации");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🌐 Загружаем данные с API:", apiUrl);

        const res = await axios.get(apiUrl);
        const data = res.data;

        if (Array.isArray(data)) {
          setCryptoData(data);
        } else {
          console.warn("⚠️ Ожидался массив, но получено:", typeof data);
          setCryptoData([]);
          setError("Неверный формат данных от API");
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки крипты:", err.message);
        setError("Ошибка загрузки данных с сервера");
        setCryptoData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCrypto();
  }, [apiUrl]);

  return { cryptoData, loading, error };
};
