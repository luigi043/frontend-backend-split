// Route: /api/items
// Reads the product catalog from a JSON file (mock database) and returns it.
// Supports optional ?category= and ?search= query params so the same endpoint
// can power server-side filtering as well as the client-side filtering in the UI.

const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "items.json");

// GET /api/items  ->  [{ id, name, price, category }, ...]
router.get("/", async (req, res, next) => {
  try {
    const { category, search } = req.query;
    if ([category, search].some(value => value !== undefined && typeof value !== "string")) {
      return res.status(400).json({ error: "category and search must each be a single string" });
    }
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    let items = JSON.parse(raw);
    if (!Array.isArray(items) || items.some(item =>
      !item || !Number.isInteger(item.id) || typeof item.name !== "string" ||
      typeof item.category !== "string" || !Number.isFinite(item.price) || item.price < 0 ||
      (item.description !== undefined && typeof item.description !== "string")
    )) throw new Error("Invalid catalog data");

    // Optional filter by category (exact, case-insensitive).
    if (category && category.toLowerCase() !== "all") {
      items = items.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Optional filter by name substring (case-insensitive).
    if (search) {
      const query = search.trim().toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    res.json(items);
  } catch (err) {
    next(err); // forward to the central error handler in server.js
  }
});

module.exports = router;
