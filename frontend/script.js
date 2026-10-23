// DataBridge front-end.
// Fetches product data once from the backend API, then renders it as cards.
// Handles loading, error, and empty states, plus client-side search + category
// filtering (instant, no extra network requests).

const API_URL = "http://localhost:5000/api/items";

// --- DOM references ---
const controlsEl = document.getElementById("controls");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const emptyEl = document.getElementById("empty");
const gridEl = document.getElementById("grid");
const retryBtn = document.getElementById("retry");

// Master copy of all products (fetched once, filtered locally).
let allItems = [];

// Toggle which top-level state is visible.
function showState({ loading = false, error = false, grid = false, empty = false }) {
  loadingEl.hidden = !loading;
  errorEl.hidden = !error;
  emptyEl.hidden = !empty;
  gridEl.hidden = !grid;
}

// Build a single product card element.
function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";
  for (const [tag, className, value] of [
    ["span", "card__category", item.category],
    ["h2", "card__name", item.name],
    ["p", "card__desc", item.description ?? ""],
    ["span", "card__price", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price)],
  ]) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    card.appendChild(element);
  }
  return card;
}

// Populate the category dropdown from the unique categories in the data.
function populateCategories(items) {
  const selected = categoryEl.value;
  categoryEl.replaceChildren(new Option("All categories", "all"));
  const categories = [...new Set(items.map((item) => item.category))].sort();
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryEl.appendChild(option);
  });
  if (categories.includes(selected)) categoryEl.value = selected;
}

// Apply the current search + category filters and render the result.
function applyFilters() {
  const query = searchEl.value.trim().toLowerCase();
  const category = categoryEl.value;

  const filtered = allItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    showState({ empty: true });
    return;
  }

  gridEl.innerHTML = "";
  filtered.forEach((item) => gridEl.appendChild(createCard(item)));
  showState({ grid: true });
}

// Fetch products from the API and initialize the UI.
async function loadItems() {
  showState({ loading: true });
  controlsEl.hidden = true;
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const items = await res.json();
    if (!Array.isArray(items) || items.some(item => !item ||
      typeof item.name !== "string" || typeof item.category !== "string" ||
      !Number.isFinite(item.price) || item.price < 0 ||
      (item.description !== undefined && typeof item.description !== "string")
    )) throw new Error("Invalid catalog response");
    allItems = items;

    populateCategories(allItems);
    controlsEl.hidden = false;
    applyFilters();
  } catch (err) {
    console.error("[DataBridge] Failed to load items:", err);
    showState({ error: true });
  }
}

// --- Events ---
searchEl.addEventListener("input", applyFilters);
categoryEl.addEventListener("change", applyFilters);
retryBtn.addEventListener("click", loadItems);

// Kick things off once the page is ready.
loadItems();
