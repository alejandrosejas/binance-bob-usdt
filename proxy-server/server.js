const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

// Process error handlers
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Enable CORS middleware with specific options
app.use(
  cors({
    origin: ["https://alejandrosejas.github.io", "https://alejandrosejas.github.io/binance-bob-usdt", "http://localhost:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    referer: req.headers.referer,
  });
  next();
});

// Root path handler
app.get("/", (req, res) => {
  console.log("Root path requested");
  res.json({
    status: "ok",
    message: "Binance P2P Proxy Server",
    endpoints: {
      health: "/health",
      proxy: "/api/binance/p2p",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.json({ status: "ok" });
});

// Handle HEAD requests for root and health endpoints
app.head(["/", "/health"], (req, res) => {
  console.log("HEAD request received for:", req.path);
  res.status(200).end();
});

// Explicit OPTIONS handler for the proxy endpoint
app.options("/api/binance/p2p", (req, res) => {
  console.log("OPTIONS request received for /api/binance/p2p");
  res.status(204).end();
});

// Proxy endpoint
app.post("/api/binance/p2p", async (req, res) => {
  console.log("Received P2P request:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  try {
    console.log("Making request to Binance API...");
    const response = await axios.post("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", req.body, {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://p2p.binance.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });
    console.log("Binance API response received:", response.status);
    res.json(response.data);
  } catch (error) {
    console.error("Proxy server error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.status(error.response?.status || 500).json({
      error: "Error fetching data from Binance",
      details: error.message,
      status: error.response?.status,
    });
  }
});

// In-memory storage for price data
let priceHistory = [];
const MAX_HISTORY_LENGTH = 1000; // Keep last 1000 price points
const FETCH_INTERVAL = 60000; // 60 seconds

// Function to fetch prices from Binance
async function fetchPrices() {
  const fetchPrice = async (tradeType) => {
    try {
      const response = await axios.post(
        "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
        {
          fiat: "BOB",
          page: 1,
          rows: 20,
          tradeType,
          asset: "USDT",
          countries: [],
          proMerchantAds: false,
          shieldMerchantAds: false,
          filterType: "all",
          periods: [],
          additionalKycVerifyFilter: 0,
          publisherType: "merchant",
          payTypes: [],
          classifies: ["mass", "profession", "fiat_trade"],
          tradedWith: false,
          followed: false,
        },
        {
          headers: {
            accept: "*/*",
            "content-type": "application/json",
            origin: "https://p2p.binance.com",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          },
        }
      );

      const prices = response.data.data.map((item) => parseFloat(item.adv.price)).filter((price) => !isNaN(price));
      if (prices.length === 0) return null;

      return {
        price: prices[0],
        range: {
          highest: Math.max(...prices),
          lowest: Math.min(...prices),
        },
      };
    } catch (error) {
      console.error(`Error fetching ${tradeType} price:`, error.message);
      return null;
    }
  };

  const [buyData, sellData] = await Promise.all([fetchPrice("BUY"), fetchPrice("SELL")]);

  if (buyData && sellData) {
    const timestamp = Date.now();
    const newPrices = [
      { ...buyData, timestamp, tradeType: "BUY" },
      { ...sellData, timestamp, tradeType: "SELL" },
    ];

    priceHistory = [...priceHistory, ...newPrices].slice(-MAX_HISTORY_LENGTH);
    console.log("Price data updated:", newPrices);

    // Emit event for SSE clients
    process.emit("priceUpdate");
  }
}

// Start continuous price fetching
console.log("Starting continuous price fetching every 60 seconds");
fetchPrices(); // Initial fetch
setInterval(fetchPrices, FETCH_INTERVAL);

// Track SSE connections for data streaming
app.get("/api/prices/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial data
  const latestPrices = priceHistory.slice(-2);
  res.write(`data: ${JSON.stringify(latestPrices)}\n\n`);

  // Send updates when new prices are fetched
  const sendUpdate = () => {
    const latestPrices = priceHistory.slice(-2);
    res.write(`data: ${JSON.stringify(latestPrices)}\n\n`);
  };

  // Listen for price updates
  const updateListener = () => sendUpdate();
  process.on("priceUpdate", updateListener);

  // Cleanup listener on client disconnect
  req.on("close", () => {
    process.removeListener("priceUpdate", updateListener);
  });
});

// Endpoint to get latest price data
app.get("/api/prices/latest", (req, res) => {
  const latestPrices = priceHistory.slice(-2);
  res.json(latestPrices);
});

// Endpoint to get price history
app.get("/api/prices/history", (req, res) => {
  res.json(priceHistory);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express error handler:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// Add catch-all route handler for undefined routes
app.use("*", (req, res) => {
  console.log("404 - Route not found:", req.method, req.originalUrl);
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log("Environment:", {
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV,
  });
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
