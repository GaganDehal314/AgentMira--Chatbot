# Configuration Settings Checklist

This document lists all configuration settings that need to be set up before testing the application.

## Backend Configuration (`.env` file)

Create a `.env` file in the `backend/` directory with the following settings:

### Required Settings

1. **MongoDB Connection (`MONGO_URI`)**
   - **Purpose**: Database connection string for storing saved properties
   - **Local MongoDB**: `mongodb://localhost:27017`
   - **MongoDB Atlas (Cloud)**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - **File**: `backend/config.py` (line 7)
   - **Status**: ⚠️ **REQUIRED** - App will fail without valid MongoDB connection

2. **MongoDB Database Name (`MONGO_DB`)**
   - **Purpose**: Name of the database to use
   - **Default**: `real_estate`
   - **File**: `backend/config.py` (line 8)
   - **Status**: ✅ Has default, but should be set explicitly

3. **CORS Allowed Origins (`ALLOWED_ORIGINS`)**
   - **Purpose**: Frontend URLs allowed to access the API
   - **Local Development**: `http://localhost:3000,http://127.0.0.1:3000`
   - **Production**: Add your GitHub Pages URL (e.g., `https://username.github.io`)
   - **File**: `backend/config.py` (line 9)
   - **Status**: ✅ Has defaults for local dev, update for production

### Optional Settings

4. **OpenAI API Key (`OPENAI_API_KEY`)**
   - **Purpose**: Enables NLP feature for parsing user queries
   - **How to get**: https://platform.openai.com/api-keys
   - **File**: `backend/config.py` (line 10), `backend/routes/nlp.py` (line 17)
   - **Status**: ⚠️ **OPTIONAL** - App works without it (uses fallback heuristics)
   - **Note**: If not provided, NLP endpoint uses basic keyword matching

5. **Data Directory (`DATA_DIR`)**
   - **Purpose**: Path to JSON data files
   - **Default**: `backend/data`
   - **File**: `backend/config.py` (line 11)
   - **Status**: ✅ Has default

6. **Model Path (`MODEL_PATH`)**
   - **Purpose**: Path to the ML model pickle file
   - **Default**: `complex_price_model_v2.pkl` (project root)
   - **File**: `backend/config.py` (line 12), `backend/services/model.py` (line 14)
   - **Status**: ✅ Has default (assumes file in project root)

## Frontend Configuration

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

1. **API Base URL (`VITE_API_BASE_URL`)**
   - **Purpose**: Backend API endpoint URL
   - **Local Development**: `http://localhost:8000`
   - **Production**: Your deployed backend URL (e.g., `https://your-api.railway.app`)
   - **File**: `frontend/src/services/api.ts` (line 5)
   - **Status**: ⚠️ **REQUIRED** - Frontend won't connect to backend without this
   - **Note**: For GitHub Pages, you'll need to set this in the build process or use environment variables

## Configuration Files Summary

| File | Setting | Required | Default | Notes |
|------|---------|----------|---------|-------|
| `backend/config.py` | `MONGO_URI` | ✅ Yes | `mongodb://localhost:27017` | Must be valid MongoDB connection |
| `backend/config.py` | `MONGO_DB` | ⚠️ Recommended | `real_estate` | Should match your database name |
| `backend/config.py` | `ALLOWED_ORIGINS` | ⚠️ For production | `localhost:3000` | Add GitHub Pages URL when deploying |
| `backend/config.py` | `OPENAI_API_KEY` | ❌ No | `None` | Optional - enables advanced NLP |
| `backend/config.py` | `DATA_DIR` | ❌ No | `backend/data` | Only change if moving data files |
| `backend/config.py` | `MODEL_PATH` | ❌ No | `complex_price_model_v2.pkl` | Only change if model file is elsewhere |
| `frontend/.env.local` | `VITE_API_BASE_URL` | ✅ Yes | `http://localhost:8000` | Must point to running backend |

## Quick Setup Steps

1. **Create `backend/.env` file:**
   ```bash
   cd backend
   # Copy the example file
   cp .env.example .env
   # Edit .env and fill in your MongoDB URI
   ```

2. **Set up MongoDB:**
   - **Option A (Local)**: Install MongoDB locally and ensure it's running
   - **Option B (Cloud)**: Create a free MongoDB Atlas account and get connection string

3. **Create `frontend/.env.local` file:**
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
   ```

4. **Optional - Add OpenAI API Key:**
   - Get key from https://platform.openai.com/api-keys
   - Add to `backend/.env`: `OPENAI_API_KEY=sk-...`

## Testing Configuration

After setting up, test your configuration:

1. **Test MongoDB connection:**
   ```bash
   cd backend
   python -c "from backend.db import get_database; print('MongoDB connected:', get_database().name)"
   ```

2. **Test model loading:**
   ```bash
   cd backend
   python -c "from backend.services.model import price_model; print('Model loaded:', price_model._model is not None)"
   ```

3. **Test API:**
   ```bash
   cd backend
   uvicorn main:app --reload
   # Visit http://localhost:8000/docs to see API docs
   ```

## Production Deployment Notes

- **Backend**: Set all environment variables in your hosting platform (Render, Railway, Heroku, etc.)
- **Frontend**: Set `VITE_API_BASE_URL` in GitHub Actions workflow or build process
- **CORS**: Update `ALLOWED_ORIGINS` to include your GitHub Pages URL
- **MongoDB**: Use MongoDB Atlas for cloud database (free tier available)

