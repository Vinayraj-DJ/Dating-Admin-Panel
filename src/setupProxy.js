const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://friend-circle-nine.vercel.app",
      changeOrigin: true,
      secure: true,
      pathRewrite: { "^/api": "" }, // removes /api prefix
      logLevel: "debug",
      onProxyReq(proxyReq, req) {
        console.log("[PROXY] →", req.method, proxyReq.getHeader("host") + proxyReq.path);
      },
      onProxyRes(proxyRes, req) {
        console.log("[PROXY] ←", proxyRes.statusCode, req.method, req.originalUrl);
      },
    })
  );
};
