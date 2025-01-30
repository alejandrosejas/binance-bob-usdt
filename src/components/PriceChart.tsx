import { PriceData } from '../services/binanceApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  priceHistory: PriceData[];
}

export const PriceChart = ({ priceHistory }: PriceChartProps) => {
  const formatData = () => {
    const groupedData = new Map();
    
    priceHistory.forEach(({ price, timestamp, tradeType }) => {
      const timeKey = new Date(timestamp).toLocaleTimeString();
      const existing = groupedData.get(timeKey) || {};
      groupedData.set(timeKey, {
        ...existing,
        time: timeKey,
        [tradeType]: price,
      });
    });

    return Array.from(groupedData.values());
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Price History</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="BUY"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="SELL"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};