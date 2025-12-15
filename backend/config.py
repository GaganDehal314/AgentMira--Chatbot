from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional



class Settings(BaseSettings):
    # MongoDB connection string – override via MONGO_URI in your .env for production
    mongo_uri: str = "mongodb+srv://dehalgagan2209_db_user:6!fYx7Q5~zpJY2u@cluster1.9t6xa8p.mongodb.net/?appName=Cluster1"
    mongo_db: str = "real_estate"

    # Raw env override for allowed origins. This is read from the ALLOWED_ORIGINS
    # environment variable and then parsed into a list via the `allowed_origins`
    # property below. This avoids pydantic's JSON parsing issues with List[str].
    allowed_origins_raw: Optional[str] = None

    # Kept for backwards compatibility, but NLP route now reads OPENAI_API_KEY via os.getenv directly
    openai_api_key: Optional[str] = None
    data_dir: str = "backend/data"
    model_path: str = "complex_price_model_v2.pkl"

    class Config:
        env_file = ".env"

    @property
    def allowed_origins(self) -> List[str]:
        """Return the list of allowed origins, using env override if present.

        - If ALLOWED_ORIGINS is set, we accept either:
          * JSON array string: '["https://a.com","https://b.com"]'
          * Comma-separated list: 'https://a.com,https://b.com'
        - If not set, fall back to sensible defaults for local dev + GitHub Pages.
        """
        default = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
            "https://gagandehal314.github.io",
            "https://gagandehal314.github.io/AgentMira--Chatbot",
        ]

        if not self.allowed_origins_raw:
            return default

        raw = self.allowed_origins_raw.strip()
        if not raw:
            return default

        # Try to parse as JSON list first
        try:
            import json

            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(item) for item in parsed if str(item).strip()]
        except Exception:
            pass

        # Fallback: treat as comma-separated list
        return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

