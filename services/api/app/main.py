# app/main.py

from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import Redis
from app.services.cache import DataCache
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings

from app.routers.auth import router as auth_router
from app.routers.spotify import router as spotify_router
from app.routers.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app):
    redis = Redis.from_url(settings.redis_url, decode_responses=True,
                           socket_connect_timeout=2, socket_timeout=2)
    app.state.data_cache = DataCache(redis)
    try:
        yield
    finally:
        await redis.aclose()


app = FastAPI(title=settings.app_name, lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Data-Fetched-At", "X-Data-Stale", "Retry-After"],
)


@app.middleware('http')
async def private_response_headers(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith(('/spotify', '/analytics', '/auth')):
        response.headers['Cache-Control'] = 'no-store'
    return response


app.include_router(auth_router)

app.include_router(spotify_router)

app.include_router(analytics_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
    }
