import { useState, useEffect } from "react";

export const RefreshTimer = () => {
  const [timeLeft, setTimeLeft] = useState(60000); // 60 seconds

  useEffect(() => {
    // Sync with server time by getting the current second
    const now = new Date();
    const secondsPassed = now.getSeconds();
    const initialTimeLeft = (60 - secondsPassed) * 1000;
    setTimeLeft(initialTimeLeft);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          return 60000;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className="text-center text-sm text-gray-500">
      <div>
        Next update in {seconds} second{seconds !== 1 ? "s" : ""}
      </div>
      <div className="mt-1 text-xs text-gray-400">Server updates every minute (XX:00)</div>
    </div>
  );
};
