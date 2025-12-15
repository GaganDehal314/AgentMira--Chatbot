# Real Estate Chatbot (React + FastAPI + MongoDB)

Full-stack chatbot that merges property data from three JSON sources, filters based on user intent/filters, and persists saved homes in MongoDB.

## Stack
- Backend: FastAPI, Motor (MongoDB), optional OpenAI NLP
- Frontend: React (Vite), React Query, Axios
- Data: `backend/data/property_basics.json`, `property_characteristics.json`, `property_images.json`

## Backend
### Setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\\Scripts\\activate on Windows
pip install -r requirements.txt
```

Create `.env` (root) with:
```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=real_estate
ALLOWED_ORIGINS=http://localhost:3000
OPENAI_API_KEY=sk-...
MODEL_PATH=complex_price_model_v2.pkl
```

### Run
```bash
uvicorn main:app --reload --port 8000
```

### Key endpoints
- `GET /health`
- `GET /properties/search` (query params: location, min_price, max_price, min_bedrooms, min_bathrooms, amenities, sort_by, sort_order, page, page_size)
- `GET /properties/{id}`
- `POST /properties/compare` (body: `{"property_ids": []}`)
- `GET /users/{userId}/saved`
- `POST /users/{userId}/saved` (body: `{"property_id": "prop-001"}`)
- `DELETE /users/{userId}/saved/{propertyId}`
- `POST /nlp/parse` (optional OpenAI; fallback heuristic if not configured)
- `POST /compare/predict` (body: `{"address_a": "...", "address_b": "..."}`) — returns two matched properties with predicted prices and model features.

### Tests
```bash
pytest
```

## Frontend
### Setup
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
```
Build for GitHub Pages:
```bash
npm run build
```
Deploy the `dist/` folder (or use gh-pages action). Ensure `VITE_API_BASE_URL` points to the hosted API.

## Deployment notes
- Host API (Render/Fly/Heroku). Set env vars and allow CORS for your GitHub Pages origin.
- Host frontend on GitHub Pages; API base URL must be the deployed API URL.

## Optional NLP
If `OPENAI_API_KEY` is present, `/nlp/parse` uses OpenAI to extract filters. Without a key, a simple heuristic runs.

