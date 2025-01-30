import { useState, useEffect } from "react";
import { fetchPrice, fetchPriceRange, PriceData, PriceRange } from "../services/binanceApi";
import { loadPriceHistory, savePriceHistory } from "../lib/storage";

export interface DetailedPriceData extends PriceData {
  range: PriceRange;
}

export const usePriceData = (refreshInterval = 30000) => {
  const [priceHistory, setPriceHistory] = useState<DetailedPriceData[]>(() => loadPriceHistory());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const [buyPrice, sellPrice, buyRange, sellRange] = await Promise.all([fetchPrice("BUY"), fetchPrice("SELL"), fetchPriceRange("BUY"), fetchPriceRange("SELL")]);

      const timestamp = Date.now();
      const newData: DetailedPriceData[] = [
        { price: buyPrice, timestamp, tradeType: "BUY", range: buyRange },
        { price: sellPrice, timestamp, tradeType: "SELL", range: sellRange },
      ];

      setPriceHistory((prev) => {
        const updated = [...prev, ...newData];
        savePriceHistory(updated);
        return updated;
      });

      setError(null);
    } catch (err) {
      setError("Failed to fetch price data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { priceHistory, loading, error };
};
