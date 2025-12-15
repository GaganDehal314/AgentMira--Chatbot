# Deploying the FastAPI service

## Render (example)
1) Create a new Web Service from your repo.
2) Environment: `Docker` (or `Python 3`), Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`.
3) Env vars:
   - `MONGO_URI` (e.g., from MongoDB Atlas)
   - `MONGO_DB=real_estate`
   - `ALLOWED_ORIGINS=https://<your-gh-pages-domain>`
   - `OPENAI_API_KEY` (optional)
4) Add health check `/health`.

## Fly.io (example)
- `flyctl launch` in backend, set `PORT=8000`, internal port 8000.
- `flyctl secrets set MONGO_URI=... MONGO_DB=real_estate ALLOWED_ORIGINS=...`.
- Deploy with `flyctl deploy`.

## Notes
- Ensure MongoDB has a user with limited privileges for the `real_estate` DB.
- Update CORS origins to include your GitHub Pages domain.
- Keep OpenAI key optional; route gracefully falls back when absent.

