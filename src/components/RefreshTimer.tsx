import { useState, useEffect } from "react";

interface RefreshTimerProps {
  refreshInterval: number;
}

export const RefreshTimer = ({ refreshInterval }: RefreshTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(refreshInterval);

  // Reset timer when refresh interval changes
  useEffect(() => {
    setTimeLeft(refreshInterval);
  }, [refreshInterval]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          return refreshInterval;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className="text-center text-sm text-gray-500">
      Next update in {seconds} second{seconds !== 1 ? "s" : ""}
    </div>
  );
};
