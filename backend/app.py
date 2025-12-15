from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import get_settings
from backend.routes import health, properties, saved, nlp, compare


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Real Estate Chatbot API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(properties.router)
    app.include_router(saved.router)
    app.include_router(nlp.router)
    app.include_router(compare.router)
    return app


app = create_app()
