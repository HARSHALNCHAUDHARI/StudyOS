const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:3000',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end('<h3>Connecting to StudyOS AI on port 3000...</h3><script>setTimeout(() => location.reload(), 1500);</script>');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(3001, '0.0.0.0', () => {
  console.log('StudyOS Port Bridge active: http://localhost:3001 -> http://localhost:3000');
});
