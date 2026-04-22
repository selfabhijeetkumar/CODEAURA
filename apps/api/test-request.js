const http = require('http');

const data = JSON.stringify({
  code: "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}"
});

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let chunks = '';
  res.on('data', chunk => chunks += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(chunks), null, 2)));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
