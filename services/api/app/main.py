from fastapi import FastAPI

from app.config.settings import settings
from app.routers.auth import router as auth_router


app = FastAPI(title=settings.app_name)
app.include_router(auth_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
    }