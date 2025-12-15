from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    mongo_uri: str = "mongodb+srv://dehalgagan2209_db_user:RfONLnY9OmzhFsO9@cluster1.9t6xa8p.mongodb.net/?appName=Cluster1"
    mongo_db: str = "real_estate"
    # Frontend origins allowed to call this API
    # Note: includes legacy frontend (3000) and new Lovable/Vite frontend (8080/5173/4173)
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
    openai_api_key: Optional[str] = None
    data_dir: str = "backend/data"
    model_path: str = "complex_price_model_v2.pkl"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()

