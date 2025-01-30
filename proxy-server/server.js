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
app.use(cors()); // Allow all origins temporarily for testing

app.use(express.json());

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
