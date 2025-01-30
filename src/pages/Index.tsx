import { usePriceData } from '../hooks/usePriceData';
import { PriceTable } from '../components/PriceTable';
import { PriceChart } from '../components/PriceChart';
import { useToast } from '../hooks/use-toast';
import { useEffect } from 'react';

const Index = () => {
  const { priceHistory, loading, error } = usePriceData();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            USDT/BOB Price Monitor
          </h1>
          <p className="text-gray-500">
            Real-time P2P prices from Binance
          </p>
        </div>
        
        <div className="space-y-8">
          <PriceTable priceHistory={priceHistory} loading={loading} />
          <PriceChart priceHistory={priceHistory} />
        </div>
      </div>
    </div>
  );
};

export default Index;