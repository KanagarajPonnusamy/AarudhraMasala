const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const TARGET = 'https://www.aarudhramasala.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const server = http.createServer((req, res) => {
  console.log(`[PROXY] ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const parsed = url.parse(req.url);
  const options = {
    hostname: 'www.aarudhramasala.com',
    port: 443,
    path: parsed.path,
    method: req.method,
    headers: { ...req.headers, host: 'www.aarudhramasala.com' },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Merge proxy response headers with CORS headers (CORS takes precedence)
    const headers = { ...proxyRes.headers, ...CORS_HEADERS };
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, CORS_HEADERS);
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log('CORS proxy running at http://localhost:' + PORT + ' -> ' + TARGET);
});
