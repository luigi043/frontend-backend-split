# DataBridge — Front-End + Back-End Split Demo

A small web app that demonstrates **client–server architecture**: a Vanilla JS
front-end fetches product data from a Node.js/Express REST API that reads from a
local JSON file.

## Architecture

```
Browser (frontend/)              Server (backend/)
  index.html  --fetch()-->  GET /api/items  -->  data/items.json
  script.js   <--JSON-----  Express + CORS   <--  (read file)
  style.css
```

## Tech Stack

| Layer    | Tech                    | Why                                 |
| -------- | ----------------------- | ----------------------------------- |
| Frontend | HTML5, CSS3, Vanilla JS | Shows raw fetch() with no framework |
| Backend  | Node.js, Express        | Fast, standard REST API setup       |
| Data     | `data/items.json`       | Simulates a DB without the overhead |

## Project Structure

```
databridge/
├── backend/
│   ├── server.js          # Express app, CORS, error handling
│   ├── routes/items.js    # GET /api/items (+ optional filters)
│   ├── data/items.json    # Product catalog (mock DB)
│   └── package.json
├── frontend/
│   ├── index.html         # Markup + search/filter controls
│   ├── style.css          # Responsive card grid, spinner
│   └── script.js          # fetch(), render, loading/error states
└── README.md
```

## Run it

```bash
# 1. Start the backend
cd backend
npm install
npm start            # API on http://localhost:5000

# 2. Serve the frontend (separate terminal)
cd frontend
npx serve .          # or: python3 -m http.server 5500
# then open the printed URL in a browser
```

> Open the frontend through a local server (not `file://`) so `fetch()` works
> against `http://localhost:5000`.

## API

`GET /api/items` — returns the full product list as JSON.

Optional query params (also filterable client-side):

| Param      | Example                     | Effect                        |
| ---------- | --------------------------- | ----------------------------- |
| `category` | `/api/items?category=Audio` | Filter by category            |
| `search`   | `/api/items?search=phone`   | Filter by name (case-insens.) |

Sample response:

```json
[
  { "id": 1, "name": "Aero Laptop 14", "price": 1200, "category": "Computers" }
]
```

## Features

- Responsive card grid (mobile + desktop)
- Loading spinner while fetching
- Error state when the API is unreachable
- Live search box (filters by name)
- Category filter
- Hover micro-interaction on cards

## SDLC mapping

Planning -> Requirements (fetch + display + handle errors) -> Design (this README)
-> Implementation (backend first, then frontend) -> Testing (API returns JSON, UI
renders, errors handled) -> Deployment (frontend: Netlify/Vercel, backend:
Render/Railway).
