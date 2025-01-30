import { DetailedPriceData } from "../hooks/usePriceData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceTableProps {
  priceHistory: DetailedPriceData[];
  loading: boolean;
}

export const PriceTable = ({ priceHistory, loading }: PriceTableProps) => {
  const getLatestPrice = (tradeType: "BUY" | "SELL") => {
    return priceHistory.filter((data) => data.tradeType === tradeType).slice(-1)[0]?.price || 0;
  };

  const getLatestRange = (tradeType: "BUY" | "SELL") => {
    return priceHistory.filter((data) => data.tradeType === tradeType).slice(-1)[0]?.range || { highest: 0, lowest: 0 };
  };

  const PriceDisplay = ({ type, price, range }: { type: "BUY" | "SELL"; price: number; range: { highest: number; lowest: number } }) => (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{type === "BUY" ? "Buy Price" : "Sell Price"}</span>
          <Badge variant={type === "BUY" ? "default" : "destructive"}>{type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Current Price</div>
            <div className={`text-2xl font-bold ${type === "BUY" ? "text-green-600" : "text-red-600"}`}>{price.toFixed(2)} BOB</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Range</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Highest</TableCell>
                <TableCell className="text-right">{range.highest.toFixed(2)} BOB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lowest</TableCell>
                <TableCell className="text-right">{range.lowest.toFixed(2)} BOB</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PriceDisplay type="BUY" price={getLatestPrice("BUY")} range={getLatestRange("BUY")} />
      <PriceDisplay type="SELL" price={getLatestPrice("SELL")} range={getLatestRange("SELL")} />
    </div>
  );
};
