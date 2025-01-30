const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:8080' // Updated to match your Vite server port
}));

app.use(express.json());

// Proxy endpoint
app.post('/api/binance/p2p', async (req, res) => {
  try {
    const response = await axios.post(
      'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
      req.body,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'origin': 'https://p2p.binance.com'
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
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 