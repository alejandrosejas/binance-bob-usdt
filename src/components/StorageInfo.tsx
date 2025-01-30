import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedPriceData } from "@/hooks/usePriceData";
import { AlertTriangle } from "lucide-react";

interface StorageInfoProps {
  priceHistory: DetailedPriceData[];
}

export const StorageInfo = ({ priceHistory }: StorageInfoProps) => {
  const oldestDate = priceHistory.length > 0 ? new Date(priceHistory[0].timestamp).toLocaleString() : "N/A";

  const newestDate = priceHistory.length > 0 ? new Date(priceHistory[priceHistory.length - 1].timestamp).toLocaleString() : "N/A";

  const storageUsage = (JSON.stringify(priceHistory).length / 1024).toFixed(2);
  const isStorageHigh = Number(storageUsage) > 1024; // Warning if over 1MB

  const timeSpan = priceHistory.length > 1 ? Math.round((priceHistory[priceHistory.length - 1].timestamp - priceHistory[0].timestamp) / (1000 * 60 * 60)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Storage Information</span>
          {isStorageHigh && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
        </CardTitle>
        <CardDescription>Historical data details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Records</p>
              <p className="font-medium">{priceHistory.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Time Span</p>
              <p className="font-medium">{timeSpan} hours</p>
            </div>
            <div>
              <p className="text-gray-500">First Record</p>
              <p className="font-medium">{oldestDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Latest Record</p>
              <p className="font-medium">{newestDate}</p>
            </div>
          </div>
          {isStorageHigh && <p className="text-sm text-yellow-600">Storage usage is high ({storageUsage} KB). Older records will be automatically trimmed.</p>}
        </div>
      </CardContent>
    </Card>
  );
};
