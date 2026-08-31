from fastapi import FastAPI

from app.config.settings import settings


app = FastAPI(title=settings.app_name)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
    }