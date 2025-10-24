const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to backend
      },
      onProxyReq: (proxyReq) => {
        // Log proxied requests (optional, for debugging)
        console.log('Proxying:', proxyReq.method, proxyReq.path);
      },
      // Disable WebSocket proxying to prevent errors
      ws: false,
    })
  );

  // Suppress WebSocket connection attempts
  app.use((req, res, next) => {
    if (req.url === '/ws') {
      return res.status(404).end();
    }
    next();
  });
};

