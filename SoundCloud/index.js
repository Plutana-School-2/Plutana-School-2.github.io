const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy Configuration Helper
const createSCProxy = (target, pathId) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: { [`^/sc/${pathId}`]: '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
  },
  onError: (err, req, res) => {
    console.error(`Proxy Error (${pathId}):`, err.message);
    res.status(500).send('Proxy Error');
  }
});

// Proxy routes
app.use('/sc/v1', createSCProxy('https://api.soundcloud.com', 'v1'));
app.use('/sc/v2', createSCProxy('https://api-v2.soundcloud.com', 'v2'));

app.listen(PORT, () => {
  console.log(`\x1b[32m✔ SoundCloud Proxy running at http://localhost:${PORT}\x1b[0m`);
});
