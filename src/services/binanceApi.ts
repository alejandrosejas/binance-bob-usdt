import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL + "/api/binance/p2p";

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
  const config = {
    method: "post",
    url: BASE_URL,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    data: { ...defaultData, tradeType },
  };

  try {
    const response = await axios.request(config);
    const firstPrice = response.data.data[0]?.adv?.price;
    return parseFloat(firstPrice) || 0;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        console.error("Access error:", error);
        throw new Error("Unable to access Binance API. Please try again later.");
      }
    }
    console.error("Error fetching price:", error);
    throw error;
  }
};

export const fetchPriceRange = async (tradeType: "BUY" | "SELL"): Promise<PriceRange> => {
  const config = {
    method: "post",
    url: BASE_URL,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    data: { ...defaultData, tradeType },
  };

  try {
    const response = await axios.request<BinanceResponse>(config);
    const prices = response.data.data.map((item) => parseFloat(item.adv.price)).filter((price: number) => !isNaN(price));

    if (prices.length === 0) {
      return { highest: 0, lowest: 0 };
    }

    return {
      highest: Math.max(...prices),
      lowest: Math.min(...prices),
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        console.error("Access error:", error);
        throw new Error("Unable to access Binance API. Please try again later.");
      }
    }
    console.error("Error fetching price range:", error);
    throw error;
  }
};
