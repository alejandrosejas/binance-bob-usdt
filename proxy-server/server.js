const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Process error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Enable CORS middleware with specific options
app.use(cors({
  origin: 'https://alejandrosejas.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok' });
});

// Proxy endpoint
app.post('/api/binance/p2p', async (req, res) => {
  console.log('Received P2P request:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Set CORS headers explicitly
  res.setHeader('Access-Control-Allow-Origin', 'https://alejandrosejas.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  try {
    console.log('Making request to Binance API...');
    const response = await axios.post(
      'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
      req.body,
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'origin': 'https://p2p.binance.com',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      }
    );
    console.log('Binance API response received:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy server error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(error.response?.status || 500).json({
      error: 'Error fetching data from Binance',
      details: error.message,
      status: error.response?.status
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('Environment:', {
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV
  });
}); 

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 