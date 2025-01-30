import { useState, useEffect } from "react";
import { DetailedPriceData } from "../services/binanceApi";
import { loadPriceHistory, savePriceHistory } from "../lib/storage";

export const usePriceData = () => {
  const [priceHistory, setPriceHistory] = useState<DetailedPriceData[]>(() => loadPriceHistory());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/api/prices/stream`);

    eventSource.onmessage = (event) => {
      const newPrices = JSON.parse(event.data);
      setPriceHistory((prev) => {
        const updated = [...prev, ...newPrices].slice(-1000); // Keep last 1000 entries
        savePriceHistory(updated);
        return updated;
      });
      setLoading(false);
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setError("Failed to connect to price stream");
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { priceHistory, loading, error };
};
