from functools import lru_cache
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection

from backend.config import get_settings


@lru_cache
def get_client() -> AsyncIOMotorClient:
    settings = get_settings()
    return AsyncIOMotorClient(os.getenv("MONGO_URI"))


def get_database() -> AsyncIOMotorDatabase:
    settings = get_settings()
    return get_client()[settings.mongo_db]


def get_saved_collection() -> AsyncIOMotorCollection:
    return get_database()["saved_properties"]

