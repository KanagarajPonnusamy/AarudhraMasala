const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;
const TARGET = 'http://www.aarudhramasala.com';

// Allow all origins for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy all /am and /api requests to the real server
app.use(
  ['/am', '/api'],
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    onProxyRes(proxyRes) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    },
    logLevel: 'debug',
  })
);

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying /am/* and /api/* -> ${TARGET}`);
});
