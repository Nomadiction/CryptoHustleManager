// frontend/hooks/useCryptoData.js

import { useEffect, useState, useRef } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import Constants from "expo-constants";

export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  const apiUrl = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    if (!apiUrl) {
      console.error("❌ API URL не задан в extra.API_URL");
      setError("API URL не найден в конфигурации");
      setLoading(false);
      return;
    }

    const wsUrl = apiUrl.replace(/^http/, "ws");

    ws.current = new ReconnectingWebSocket(wsUrl, [], {
      maxRetries: 10,
      reconnectInterval: 3000,
    });

    ws.current.addEventListener("open", () => {
      console.log("🔌 WebSocket соединение открыто:", wsUrl);
      setLoading(true);
    });

    ws.current.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "initial" || message.type === "update") {
          if (Array.isArray(message.data)) {
            setCryptoData(message.data);
          } else {
            console.warn("⚠️ Неверный формат данных в 'data'");
            setError("Неверный формат данных от сервера");
          }
        } else {
          console.warn("⚠️ Неизвестный тип сообщения:", message.type);
        }
      } catch (err) {
        console.error("❌ Ошибка парсинга сообщения:", err.message);
        setError("Ошибка парсинга данных от сервера");
      } finally {
        setLoading(false);
      }
    });

    ws.current.addEventListener("error", (err) => {
      console.error("❌ WebSocket ошибка:", err.message);
      setError("Ошибка WebSocket соединения");
      setCryptoData([]);
      setLoading(false);
    });

    ws.current.addEventListener("close", () => {
      console.log("🔌 WebSocket соединение закрыто");
    });

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [apiUrl]);

  return { cryptoData, loading, error };
};



