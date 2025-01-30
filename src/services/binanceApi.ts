import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface BinanceRequestData {
  fiat: string;
  page: number;
  rows: number;
  tradeType: "BUY" | "SELL";
  asset: string;
  countries: string[];
  proMerchantAds: boolean;
  shieldMerchantAds: boolean;
  filterType: string;
  periods: string[];
  additionalKycVerifyFilter: number;
  publisherType: string;
  payTypes: string[];
  classifies: string[];
  tradedWith: boolean;
  followed: boolean;
}

export interface PriceData {
  price: number;
  timestamp: number;
  tradeType: "BUY" | "SELL";
}

export interface PriceRange {
  highest: number;
  lowest: number;
}

export interface DetailedPriceData extends PriceData {
  range: PriceRange;
}

interface BinanceAdvertisement {
  adv: {
    price: string;
    [key: string]: any;
  };
}

interface BinanceResponse {
  data: BinanceAdvertisement[];
  [key: string]: any;
}

const defaultData: BinanceRequestData = {
  fiat: "BOB",
  page: 1,
  rows: 20,
  tradeType: "BUY",
  asset: "USDT",
  countries: [],
  proMerchantAds: false,
  shieldMerchantAds: false,
  filterType: "all",
  periods: [],
  additionalKycVerifyFilter: 0,
  publisherType: "merchant",
  payTypes: [],
  classifies: ["mass", "profession", "fiat_trade"],
  tradedWith: false,
  followed: false,
};

export const fetchPrice = async (tradeType: "BUY" | "SELL"): Promise<number> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/prices/latest`);
    const prices = response.data;
    const priceData = prices.find((p: DetailedPriceData) => p.tradeType === tradeType);
    return priceData?.price || 0;
  } catch (error: unknown) {
    console.error("Error fetching price:", error);
    throw error;
  }
};

export const fetchPriceRange = async (tradeType: "BUY" | "SELL"): Promise<PriceRange> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/prices/latest`);
    const prices = response.data;
    const priceData = prices.find((p: DetailedPriceData) => p.tradeType === tradeType);
    return priceData?.range || { highest: 0, lowest: 0 };
  } catch (error: unknown) {
    console.error("Error fetching price range:", error);
    throw error;
  }
};

export const fetchPriceHistory = async (): Promise<DetailedPriceData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/prices/history`);
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching price history:", error);
    throw error;
  }
};
