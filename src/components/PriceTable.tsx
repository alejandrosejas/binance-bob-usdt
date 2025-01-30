import { PriceData } from '../services/binanceApi';

interface PriceTableProps {
  priceHistory: PriceData[];
  loading: boolean;
}

export const PriceTable = ({ priceHistory, loading }: PriceTableProps) => {
  const getLatestPrice = (tradeType: 'BUY' | 'SELL') => {
    return priceHistory
      .filter(data => data.tradeType === tradeType)
      .slice(-1)[0]?.price || 0;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Latest Prices</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 transition-all duration-200">
            <div className="text-sm text-gray-500 mb-1">Buy Price</div>
            <div className="text-2xl font-semibold text-green-600">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : (
                `${getLatestPrice('BUY')} BOB`
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 transition-all duration-200">
            <div className="text-sm text-gray-500 mb-1">Sell Price</div>
            <div className="text-2xl font-semibold text-red-600">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : (
                `${getLatestPrice('SELL')} BOB`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};