import { DetailedPriceData } from "../hooks/usePriceData";

const STORAGE_KEY = "price_history";
const MAX_HISTORY_ITEMS = 1000; // Adjust this value based on your needs

export const loadPriceHistory = (): DetailedPriceData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored) as DetailedPriceData[];
    return data.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error("Error loading price history:", error);
    return [];
  }
};

export const savePriceHistory = (data: DetailedPriceData[]) => {
  try {
    // Keep only the latest MAX_HISTORY_ITEMS items
    const trimmedData = data.slice(-MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedData));
  } catch (error) {
    console.error("Error saving price history:", error);
  }
};

export const clearPriceHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing price history:", error);
  }
};
