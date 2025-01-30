import { usePriceData } from "../hooks/usePriceData";
import { PriceTable } from "../components/PriceTable";
import { PriceChart } from "../components/PriceChart";
import { RefreshTimer } from "../components/RefreshTimer";
import { StorageInfo } from "../components/StorageInfo";
import { Footer } from "../components/Footer";
import { useToast } from "../hooks/use-toast";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">USDT/BOB Price Monitor</h1>
                <p className="text-xs sm:text-sm text-gray-500">Real-time P2P prices from Binance</p>
              </div>
              <div className="w-full sm:w-auto text-center">
                <RefreshTimer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8">
            <div className="grid gap-8 md:grid-cols-2">
              <PriceTable priceHistory={priceHistory} loading={loading} />
              <StorageInfo priceHistory={priceHistory} />
            </div>
            <PriceChart priceHistory={priceHistory} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
