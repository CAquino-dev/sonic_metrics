from fastapi import FastAPI

from app.config.settings import settings
from app.routers.auth import router as auth_router
from app.routers.spotify import router as spotify_router
from app.routers.analytics import router as analytics_router


app = FastAPI(title=settings.app_name)

app.include_router(auth_router)
app.include_router(spotify_router)
app.include_router(analytics_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
    }