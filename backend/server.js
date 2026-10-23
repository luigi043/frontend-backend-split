// DataBridge API - Express server entry point.
// Responsibilities: wire up middleware (CORS, JSON), mount routes,
// and provide centralized 404 + error handling.

const express = require("express");
const cors = require("cors");

const itemsRouter = require("./routes/items");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());          // allow the browser front-end (different origin) to call this API
app.use(express.json());  // parse JSON request bodies

// --- Routes ---
app.use("/api/items", itemsRouter);

// Simple health check / service info at the root.
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "DataBridge API", endpoint: "/api/items" });
});

// --- 404 handler (no route matched) ---
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// --- Central error handler (any next(err) lands here) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[DataBridge] Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) app.listen(PORT, () => {
  console.log(`DataBridge API running on http://localhost:${PORT}`);
});

module.exports = app;
