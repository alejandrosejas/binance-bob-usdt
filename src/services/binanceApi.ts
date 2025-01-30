import axios from 'axios';

const BASE_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

export interface BinanceRequestData {
  fiat: string;
  page: number;
  rows: number;
  tradeType: 'BUY' | 'SELL';
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
  tradeType: 'BUY' | 'SELL';
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
  followed: false
};

export const fetchPrice = async (tradeType: 'BUY' | 'SELL'): Promise<number> => {
  const config = {
    method: 'post',
    url: BASE_URL,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'origin': 'https://p2p.binance.com',
      'referer': `https://p2p.binance.com/trade/all-payments/USDT?fiat=BOB`,
      'user-agent': 'Mozilla/5.0'
    },
    data: { ...defaultData, tradeType }
  };

  try {
    const response = await axios.request(config);
    const firstPrice = response.data.data[0]?.adv?.price;
    return parseFloat(firstPrice) || 0;
  } catch (error) {
    console.error('Error fetching price:', error);
    throw error;
  }
};