const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * CRA dev-server proxy configuration.
 *
 * This makes same-origin requests like:
 *   POST /proxy/3001/api/v1/auth/register
 * forward to the backend service:
 *   http://localhost:3001/api/v1/auth/register
 *
 * Why this exists:
 * - In preview environments we use same-origin paths ("/proxy/3001") so the browser
 *   never needs to access ":3001" directly.
 * - Without this proxy during `npm start`, the React dev server will respond with
 *   "Cannot POST ..." for non-GET routes.
 *
 * Contract:
 * - Only affects the development server (react-scripts start).
 * - Does not affect production builds.
 */
module.exports = function setupProxy(app) {
  app.use(
    "/proxy/3001",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
      secure: false,
      // Remove the prefix so the backend sees the correct path.
      pathRewrite: {
        "^/proxy/3001": "",
      },
      // Keep logs available for debugging proxy issues in dev/preview.
      logLevel: "warn",
    })
  );
};
