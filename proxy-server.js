const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const TARGET = 'https://www.aarudhramasala.com';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
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
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502);
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log('CORS proxy running at http://localhost:' + PORT + ' -> ' + TARGET);
});
