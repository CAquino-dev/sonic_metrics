"""Request-scoped facade; all routes share the same upstream cache keys."""
import asyncio
import time
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.models.spotify_token import SpotifyToken
from app.services import spotify, lastfm
from app.services.cache import DataCache, UpstreamError, retry_delay


def spotify_cooldown_key():
    return f'sonic:v1:cooldown:spotify:{settings.spotify_client_id}'


class CachedData:
    def __init__(self, cache, db, response):
        self.cache = cache
        self.db = db
        self.response = response
        self.results = []

    def record(self, result):
        self.results.append(result)
        oldest = min(item.fetched_at for item in self.results)
        self.response.headers['X-Data-Fetched-At'] = datetime.fromtimestamp(oldest, timezone.utc).isoformat()
        self.response.headers['X-Data-Stale'] = str(any(item.stale for item in self.results)).lower()
        self.response.headers['Cache-Control'] = 'no-store'
        return result.payload

    def connected(self, user_id):
        token = self.db.query(SpotifyToken).filter(SpotifyToken.user_id == user_id).first()
        if token is None:
            raise HTTPException(404, 'Spotify account is not connected.')
        return token

    async def access_token(self, user_id):
        deadline = time.monotonic() + 12
        while True:
            async with self.cache.lock(f'sonic:v1:token-lock:{user_id}') as acquired:
                if acquired:
                    token = self.connected(user_id)
                    self.db.refresh(token)
                    try:
                        access = await spotify.get_valid_access_token(
                            token, settings.spotify_client_id, settings.spotify_client_secret)
                    except UpstreamError as exc:
                        # Accounts API limits must not activate the Web API cooldown.
                        if exc.status == 429:
                            raise HTTPException(429, 'Spotify token refresh is rate limited.',
                                                headers={'Retry-After': str(retry_delay(exc.retry_after))}) from None
                        if exc.status in (400, 401, 403):
                            raise HTTPException(401, 'Reconnect your Spotify account.') from None
                        raise
                    self.db.commit()
                    return access
            if time.monotonic() >= deadline:
                raise HTTPException(503, 'Token refresh is in progress.', headers={'Retry-After': '2'})
            await asyncio.sleep(0.05)

    async def spotify(self, user_id, resource, **params):
        self.connected(user_id)
        policy = 'top' if resource in ('top_artists', 'top_tracks') else resource
        fresh = getattr(settings, f'cache_{policy}_fresh_seconds')
        max_age = getattr(settings, f'cache_{policy}_max_age_seconds')

        async def load():
            access = await self.access_token(user_id)
            remaining = await self.cache.cooldown(spotify_cooldown_key())
            if remaining:
                raise UpstreamError(429, max(0, remaining - 1))
            return await getattr(spotify, {
                'profile': 'get_current_user', 'top_artists': 'get_top_artists',
                'top_tracks': 'get_top_tracks', 'recent': 'get_recently_played',
                'player': 'get_player_state', 'artist': 'get_artist',
            }[resource])(access_token=access, **params)

        key = self.cache.key('spotify', user_id, resource, params)
        return self.record(await self.cache.get(key, fresh, max_age, load, spotify_cooldown_key()))

    async def tags(self, artist_name, limit=10):
        name = ' '.join(artist_name.split()).casefold()
        key = self.cache.key('lastfm', 'shared', 'tags', {'artist': name, 'limit': limit})
        result = await self.cache.get(key, settings.cache_tags_fresh_seconds,
                                      settings.cache_tags_max_age_seconds,
                                      lambda: lastfm.get_artist_tags(name, limit))
        return self.record(result)


def get_cached_data(request: Request, response: Response, db: Session = Depends(get_db)):
    response.headers['Cache-Control'] = 'no-store'
    return CachedData(request.app.state.data_cache, db, response)


async def oauth_profile(cache: DataCache, access_token):
    remaining = await cache.cooldown(spotify_cooldown_key())
    if remaining:
        raise HTTPException(429, 'Spotify is rate limited.', headers={'Retry-After': str(remaining)})
    try:
        return await spotify.get_current_user(access_token)
    except UpstreamError as exc:
        if exc.status == 429:
            delay = retry_delay(exc.retry_after)
            await cache.extend_cooldown(spotify_cooldown_key(), delay + 1)
            raise HTTPException(429, 'Spotify is rate limited.', headers={'Retry-After': str(await cache.cooldown(spotify_cooldown_key()))}) from None
        raise HTTPException(401 if exc.status in (401, 403) else 502, 'Spotify identity verification failed.') from None
