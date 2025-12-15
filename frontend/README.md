# Frontend Handover (Real Estate Chatbot)

This README gives another AI everything needed to rebuild or refactor the frontend without breaking the existing backend contract or data flows.

## Path Table (frontend/)

```
frontend/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── types.ts
    ├── services/
    │   └── api.ts
    └── components/
        ├── Chat.tsx
        ├── Compare.tsx
        ├── PropertyCard.tsx
        └── SavedList.tsx
```

| Path | Purpose |
| --- | --- |
| `index.html` | Vite entry HTML, mounts React at `#root`. |
| `src/main.tsx` | React bootstrap, wraps `App` with React Query provider. |
| `src/App.tsx` | Top-level layout, owns saved properties state, wires child components. |
| `src/styles.css` | Global styles for cards, grid, chat, pills. |
| `src/types.ts` | Shared TypeScript types: `Property`, `PropertySearchResponse`, `PredictedProperty`, `ComparePredictionResponse`. |
| `src/services/api.ts` | Axios client with `VITE_API_BASE_URL` (fallback `http://localhost:8000`); all backend calls. Handles array params serialization. |
| `src/components/Chat.tsx` | Chat UI with quick filters; calls NLP parse then property search; renders results and save/unsave. |
| `src/components/Compare.tsx` | Address A vs B comparison UI; calls `/compare/predict`. |
| `src/components/PropertyCard.tsx` | Reusable property card; optional save/unsave buttons. |
| `src/components/SavedList.tsx` | Renders saved properties grid. |

## Runtime setup (frontend)

- Build tool: Vite + React + TypeScript.
- Start: `npm install` then `npm run dev` (defaults to port 5173). Adjust `VITE_API_BASE_URL` in `.env` to point at the backend (default fallback `http://localhost:8000`).
- The backend CORS allows `http://localhost:3000` and `http://127.0.0.1:3000`; if you serve the frontend on a different origin, update backend allowed origins.

### Environment variables
- `VITE_API_BASE_URL` (optional): base URL for API; if not set uses `http://localhost:8000`.

## Component-by-component behavior

- `main.tsx`: Creates a `QueryClient` (React Query) and renders `App` inside `QueryClientProvider`. React Query is not otherwise used yet; safe to remove or expand, but keep behavior consistent.

- `App.tsx`:
  - State: `saved` (Property[]). Derives `userId` from `localStorage` (default `"demo-user"`); writes it back on mount.
  - Side effects: on mount, calls `refresh()` → `getSaved(userId)` to populate saved list.
  - Handlers: `handleSave`, `handleUnsave` call POST/DELETE then refresh saved list.
  - Renders: hero text, `Compare`, `Chat` (passes save/unsave/refresh), and `SavedList`.

- `Chat.tsx`:
  - Local state: chat `messages`, `input`, `filters` (quick filters), `results`, `loading`, `userId` (memoized from `localStorage`).
  - Submit flow: prevents empty input → appends user message → calls `nlpParse(text)`.
    - Always shows `text` from NLP response as bot message if present.
    - If `filters` returned, merges with quick-filter state (numbers coerced; amenities split by comma) and triggers `performSearch`.
  - Quick filters: “Search” button calls `performSearch` using current filter inputs without NLP.
  - `performSearch`: calls `/properties/search`, updates `results`, and appends a bot message summarizing count and `searchParams` used.
  - Rendering: messages with visual sections for chat vs filter searches; results grid uses `PropertyCard` with save/unsave buttons driven by `App` props.

- `Compare.tsx`:
  - State: `addressA`, `addressB`, `results`, `loading`, `error`.
  - Flow: on “Compare”, POSTs to `/compare/predict` with two addresses. On success, renders two `PropertyCard`s plus predicted price and a short feature summary. On failure, shows error string.

- `PropertyCard.tsx`:
  - Expects a `Property` object. Optional `saved`, `onSave`, `onUnsave` control the button shown. Displays first image, title, location, price, beds/baths/size, and first 4 amenities.

- `SavedList.tsx`:
  - Receives `saved` array and `onUnsave`. Renders grid of `PropertyCard`s marked as saved. Shows empty state text when list is empty.

## API integration contract (frontend ↔ backend)

Base URL: `import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"`.

- `GET /properties/search` — used by `Chat.performSearch`. Query params: `location` (string or repeated array), `min_price`, `max_price`, `min_bedrooms`, `min_bathrooms`, `amenities` (array), `sort_by`, `sort_order`, `page`, `page_size`. Returns `{ total, page, page_size, results: Property[] }`.
  - `searchProperties` sets `paramsSerializer.indexes = null` so arrays are sent as repeated query params (`location=NY&location=Boston`).

- `POST /nlp/parse` — used by `Chat.handleSubmit` via `nlpParse(text)`. Body: `{ text }`. Response: `{ filters?, text?, provider }`.
  - `filters` may be absent; when present, they are merged with quick filters and sent to `/properties/search`.
  - `text` may be absent; when present, it is always displayed as a bot message.

- `POST /compare/predict` — used by `Compare.handleCompare` via `predictComparison(addressA, addressB)`. Body: `{ address_a, address_b }`. Response: `{ properties: PredictedProperty[] }` where each extends `Property` with `predicted_price` and `features` (map used only for display).

- Saved properties (requires MongoDB via backend):
  - `GET /users/{userId}/saved` — on app load and refresh. Response: `Property[]` (backend maps saved IDs to full property docs).
  - `POST /users/{userId}/saved` — body `{ property_id }`; upserts saved doc.
  - `DELETE /users/{userId}/saved/{propertyId}` — removes saved doc.

## Data shapes (from `src/types.ts`)

- `Property`: `{ id, title, price, location, bedrooms?, bathrooms?, size?, size_sqft?, amenities: string[], images: string[] }`
- `PropertySearchResponse`: `{ total, page, page_size, results: Property[] }`
- `PredictedProperty`: `Property & { predicted_price: number, features: Record<string, any> }`
- `ComparePredictionResponse`: `{ properties: PredictedProperty[] }`

## Detailed flows to preserve

- Saved pipeline: `localStorage.userId` (default `"demo-user"`) → `GET /users/{userId}/saved` on mount → cards show Save/Unsave → Save/Unsave calls POST/DELETE → always call `refresh()` afterward to sync with backend truth.
- Chat pipeline: user submit → `/nlp/parse` → show `text` if present → when `filters` exist, merge with quick-filter state and call `/properties/search` → append bot message summarizing count and filters → render cards with save/unsave.
- Quick-filter pipeline: skip NLP → call `/properties/search` with current inputs → show results and bot summary message.
- Compare pipeline: two addresses → `/compare/predict` → render two property cards + predicted prices + feature chips; show error string on failure.
- Array/query handling: when sending arrays (e.g., `location`, `amenities`), keep repeated query params format. Do not send search via JSON body.

## External data and backend-side dependencies (do not break)

- Property data served by backend from `backend/data/*.json` via `PropertyDataLoader`. Frontend never reads these files directly.
- Saved properties stored in MongoDB (`mongo_uri` in `backend/config.py`). Frontend only sees hydrated property docs from backend.
- NLP may use OpenAI or heuristic; frontend must tolerate responses with only `text`, only `filters`, both, or neither (empty), and handle absence gracefully.
- Price comparison uses backend model `complex_price_model_v2.pkl`; frontend only displays returned `predicted_price` and `features`.

## Must-keep contracts when rebuilding the UI

- Preserve request/response shapes above; keep all `Property` fields and `predicted_price` surface.
- Keep `userId` persistence in `localStorage` and pass it to saved endpoints.
- Keep repeated-query serialization for arrays; do not change search to JSON body.
- Respect `VITE_API_BASE_URL` env override; keep default `http://localhost:8000` fallback.
- After save/unsave, re-fetch saved list to avoid drift.
- Always display NLP `text` if present; only search when filters exist.

## If README is insufficient

If you are doing a larger redesign, also ship:
- A lightweight OpenAPI/YAML contract for these endpoints.
- A sample `.env` (`VITE_API_BASE_URL=http://localhost:8000`).
- A short UX note describing the combined chat + quick-filter pattern and save/unsave affordances on cards.

This README captures current behavior and backend contracts; changing those contracts without backend updates will break the app.

