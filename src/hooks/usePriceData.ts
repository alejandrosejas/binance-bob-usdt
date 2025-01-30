import { useState, useEffect } from 'react';
import { fetchPrice, PriceData } from '../services/binanceApi';

export const usePriceData = (refreshInterval = 30000) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const [buyPrice, sellPrice] = await Promise.all([
        fetchPrice('BUY'),
        fetchPrice('SELL')
      ]);

      const timestamp = Date.now();
      const newData: PriceData[] = [
        { price: buyPrice, timestamp, tradeType: 'BUY' },
        { price: sellPrice, timestamp, tradeType: 'SELL' }
      ];

      setPriceHistory(prev => [...prev, ...newData]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch price data');
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