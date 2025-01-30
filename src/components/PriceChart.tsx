import { DetailedPriceData } from "../hooks/usePriceData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps, ReferenceArea } from "recharts";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Expand, ZoomIn, ZoomOut } from "lucide-react";

type TimeRange = "1h" | "3h" | "6h" | "12h" | "24h" | "all";
type DataType = "price" | "range";

interface PriceChartProps {
  priceHistory: DetailedPriceData[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

interface ZoomState {
  left?: number;
  right?: number;
  refAreaLeft?: string;
  refAreaRight?: string;
  isZooming: boolean;
}

interface ChartEvent {
  activeLabel?: string;
}

interface ChartData {
  time: string;
  timestamp: number;
  BUY?: number;
  SELL?: number;
  BUY_HIGH?: number;
  BUY_LOW?: number;
  SELL_HIGH?: number;
  SELL_LOW?: number;
}

export const PriceChart = ({ priceHistory }: PriceChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1h");
  const [dataType, setDataType] = useState<DataType>("price");
  const [zoom, setZoom] = useState<ZoomState>({ isZooming: false });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "1h", label: "1h" },
    { value: "3h", label: "3h" },
    { value: "6h", label: "6h" },
    { value: "12h", label: "12h" },
    { value: "24h", label: "24h" },
    { value: "all", label: "All" },
  ];

  const dataTypes: { value: DataType; label: string }[] = [
    { value: "price", label: "Price" },
    { value: "range", label: "Range" },
  ];

  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      "1h": 60 * 60 * 1000,
      "3h": 3 * 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "12h": 12 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const timeLimit = now - ranges[timeRange];
    return priceHistory.filter((data) => data.timestamp > timeLimit);
  }, [priceHistory, timeRange]);

  const chartData = useMemo(() => {
    const groupedData = new Map();

    filteredData.forEach(({ price, timestamp, tradeType, range }) => {
      const timeKey = new Date(timestamp).toLocaleTimeString();
      const existing = groupedData.get(timeKey) || {};

      if (dataType === "price") {
        groupedData.set(timeKey, {
          ...existing,
          time: timeKey,
          timestamp,
          [tradeType]: price,
        });
      } else {
        groupedData.set(timeKey, {
          ...existing,
          time: timeKey,
          timestamp,
          [`${tradeType}_HIGH`]: range.highest,
          [`${tradeType}_LOW`]: range.lowest,
        });
      }
    });

    return Array.from(groupedData.values());
  }, [filteredData, dataType]);

  const getAxisYDomain = useCallback(
    (from: number, to: number, data: ChartData[]) => {
      const refData = data.slice(from, to);
      let [bottom, top] = [Infinity, -Infinity];

      refData.forEach((d) => {
        const values = dataType === "price" ? [d.BUY, d.SELL] : [d.BUY_HIGH, d.BUY_LOW, d.SELL_HIGH, d.SELL_LOW];

        values.forEach((value) => {
          if (value !== undefined) {
            if (value > top) top = value;
            if (value < bottom) bottom = value;
          }
        });
      });

      const padding = (top - bottom) * 0.1 || 1;
      return [bottom - padding, top + padding] as [number, number];
    },
    [dataType]
  );

  const handleMouseDown = (e: ChartEvent | undefined) => {
    if (!e?.activeLabel) return;
    setZoom({ ...zoom, refAreaLeft: e.activeLabel, refAreaRight: undefined, isZooming: true });
  };

  const handleMouseMove = (e: ChartEvent | undefined) => {
    if (!zoom.isZooming || !e?.activeLabel) return;
    setZoom({ ...zoom, refAreaRight: e.activeLabel });
  };

  const handleMouseUp = () => {
    if (!zoom.refAreaLeft || !zoom.refAreaRight) {
      setZoom({ isZooming: false });
      return;
    }

    let left = chartData.findIndex((item) => item.time === zoom.refAreaLeft);
    let right = chartData.findIndex((item) => item.time === zoom.refAreaRight);

    if (left > right) [left, right] = [right, left];
    right = Math.min(right + 1, chartData.length - 1);

    setZoom({
      left,
      right,
      refAreaLeft: undefined,
      refAreaRight: undefined,
      isZooming: false,
    });
  };

  const handleZoomOut = () => {
    setZoom({ isZooming: false });
  };

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {Number(entry.value).toFixed(2)} BOB
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50" : ""}>
      <CardHeader className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Price History</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={!zoom.left && !zoom.right}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
                  <Expand className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ToggleGroup type="single" size="sm" value={dataType} onValueChange={(value) => value && setDataType(value as DataType)}>
              {dataTypes.map((type) => (
                <ToggleGroupItem key={type.value} value={type.value} className="px-3">
                  {type.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <ScrollArea className="w-full">
            <div className="flex space-x-2 py-1">
              <ToggleGroup type="single" size="sm" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
                {timeRanges.map((range) => (
                  <ToggleGroupItem key={range.value} value={range.value} className="px-3">
                    {range.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`${isFullscreen ? "h-[calc(100vh-10rem)]" : "h-[300px] sm:h-[400px]"} w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => setZoom({ isZooming: false })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" allowDataOverflow domain={zoom.left !== undefined && zoom.right !== undefined ? ["dataMin", "dataMax"] : undefined} />
              <YAxis tick={{ fontSize: 12 }} width={45} domain={zoom.left !== undefined && zoom.right !== undefined ? getAxisYDomain(zoom.left, zoom.right, chartData) : ["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} verticalAlign="top" height={36} />

              {zoom.refAreaLeft && zoom.refAreaRight ? <ReferenceArea x1={zoom.refAreaLeft} x2={zoom.refAreaRight} strokeOpacity={0.3} fill="#10B981" fillOpacity={0.1} /> : null}

              {dataType === "price" ? (
                <>
                  <Line type="monotone" dataKey="BUY" name="Buy Price" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="SELL" name="Sell Price" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="BUY_HIGH" name="Buy High" stroke="#10B981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="BUY_LOW" name="Buy Low" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="SELL_HIGH" name="Sell High" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="SELL_LOW" name="Sell Low" stroke="#EF4444" strokeWidth={2} dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
