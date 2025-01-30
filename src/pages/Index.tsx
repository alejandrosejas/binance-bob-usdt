import { usePriceData } from "../hooks/usePriceData";
import { PriceTable } from "../components/PriceTable";
import { PriceChart } from "../components/PriceChart";
import { RefreshTimer } from "../components/RefreshTimer";
import { StorageInfo } from "../components/StorageInfo";
import { Footer } from "../components/Footer";
import { useToast } from "../hooks/use-toast";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const REFRESH_OPTIONS = [
  { label: "5 seconds", value: 5000 },
  { label: "10 seconds", value: 10000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "5 minutes", value: 300000 },
];

const Index = () => {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const { priceHistory, loading, error } = usePriceData(refreshInterval);
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
              <div className="w-full sm:w-auto">
                <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFRESH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-1">
                  <RefreshTimer refreshInterval={refreshInterval} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative">
        <ScrollArea className="absolute inset-0">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <PriceTable priceHistory={priceHistory} loading={loading} />
                <PriceChart priceHistory={priceHistory} />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <StorageInfo priceHistory={priceHistory} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
