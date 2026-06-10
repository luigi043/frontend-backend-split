// DataBridge front-end.
// Fetches product data from the backend API and renders it as cards.
// Handles loading and error states.

const API_URL = "http://localhost:5000/api/items";

// --- DOM references ---
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const gridEl = document.getElementById("grid");
const retryBtn = document.getElementById("retry");

// Toggle which top-level state is visible.
function showState({ loading = false, error = false, grid = false }) {
  loadingEl.hidden = !loading;
  errorEl.hidden = !error;
  gridEl.hidden = !grid;
}

// Build a single product card element.
function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <span class="card__category">${item.category}</span>
    <h2 class="card__name">${item.name}</h2>
    <p class="card__desc">${item.description ?? ""}</p>
    <span class="card__price">$${item.price.toLocaleString()}</span>
  `;
  return card;
}

// Render a list of products into the grid.
function renderItems(items) {
  gridEl.innerHTML = "";
  items.forEach((item) => gridEl.appendChild(createCard(item)));
  showState({ grid: true });
}

// Fetch products from the API and update the UI.
async function loadItems() {
  showState({ loading: true });
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const items = await res.json();
    renderItems(items);
  } catch (err) {
    console.error("[DataBridge] Failed to load items:", err);
    showState({ error: true });
  }
}

retryBtn.addEventListener("click", loadItems);

// Kick things off once the page is ready.
loadItems();
