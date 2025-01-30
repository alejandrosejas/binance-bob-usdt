const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: ['https://alejandrosejas.github.io'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false,
  optionsSuccessStatus: 200
};

// Enable CORS for preflight requests
app.options('*', cors(corsOptions));

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://alejandrosejas.github.io');
  res.json({ status: 'ok' });
});

// Proxy endpoint
app.post('/api/binance/p2p', async (req, res) => {
  // Set CORS headers explicitly
  res.setHeader('Access-Control-Allow-Origin', 'https://alejandrosejas.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  try {
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
    res.json(response.data);
  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(error.response?.status || 500).json({
      error: 'Error fetching data from Binance',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 