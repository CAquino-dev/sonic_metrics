import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import fakeredis.aioredis
import httpx
import pytest
from fastapi import HTTPException, Response
from fastapi.testclient import TestClient

from app.config.settings import settings
from app.database.session import get_db
from app.main import app
from app.routers.spotify import router as spotify_router
from app.services import spotify, lastfm
from app.services.cache import DataCache, UpstreamError
from app.services.data import CachedData, get_cached_data, oauth_profile, spotify_cooldown_key
from app.services.dependencies import get_current_user


@pytest.fixture
def anyio_backend():
    return 'asyncio'


class TokenDB:
    def __init__(self, token):
        self.token = token
        self.commits = 0
        self.refreshes = 0

    def query(self, model):
        return self

    def filter(self, *args):
        return self

    def first(self):
        return self.token

    def refresh(self, token):
        self.refreshes += 1

    def commit(self):
        self.commits += 1


def token():
    return SimpleNamespace(access_token='expired', refresh_token='refresh',
                           expires_at=datetime.now(timezone.utc) - timedelta(seconds=10))


@pytest.mark.anyio
async def test_cached_data_skips_token_refresh_and_aggregates_headers(monkeypatch):
    redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    now = [1000.0]
    cache = DataCache(redis, clock=lambda: now[0])
    db = TokenDB(token())
    response = Response()
    data = CachedData(cache, db, response)
    refresh = AsyncMock(side_effect=AssertionError('cached hit must not refresh'))
    monkeypatch.setattr(spotify, 'get_valid_access_token', refresh)
    await cache.seed(cache.key('spotify', 1, 'profile'), {'id': 'user1'}, 10, 60)
    now[0] += 11
    await cache.seed(cache.key('spotify', 1, 'top_artists', {'time_range': 'medium_term', 'limit': 20}), {'items': []}, 60, 120)
    await cache.extend_cooldown(spotify_cooldown_key(), 30)
    assert await data.spotify(1, 'profile') == {'id': 'user1'}
    assert await data.spotify(1, 'top_artists', time_range='medium_term', limit=20) == {'items': []}
    assert response.headers['X-Data-Stale'] == 'true'
    assert response.headers['X-Data-Fetched-At'] == datetime.fromtimestamp(1000, timezone.utc).isoformat()
    assert response.headers['Cache-Control'] == 'no-store'
    assert db.refreshes == db.commits == 0
    db.token = None
    with pytest.raises(HTTPException) as error:
        await data.spotify(1, 'profile')
    assert error.value.status_code == 404
    await redis.aclose()


@pytest.mark.anyio
async def test_token_refresh_coordinated_across_resources(monkeypatch):
    redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    cache = DataCache(redis)
    shared_token = token()
    db1, db2 = TokenDB(shared_token), TokenDB(shared_token)
    first, second = CachedData(cache, db1, Response()), CachedData(cache, db2, Response())
    calls = 0

    async def refresh(*args):
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.08)
        return {'access_token': 'new', 'expires_in': 3600}

    monkeypatch.setattr(spotify, 'refresh_access_token', refresh)
    monkeypatch.setattr(spotify, 'get_top_artists', AsyncMock(return_value={'items': []}))
    monkeypatch.setattr(spotify, 'get_top_tracks', AsyncMock(return_value={'items': []}))
    await asyncio.gather(first.spotify(1, 'top_artists'), second.spotify(1, 'top_tracks'))
    assert calls == 1
    assert db1.commits == db2.commits == 1
    assert db1.refreshes == db2.refreshes == 1
    await redis.aclose()


def test_dashboard_and_analytics_share_sources(monkeypatch):
    artists = AsyncMock(return_value={'items': [{'id': 'a', 'name': 'Artist', 'images': []}]})
    tracks = AsyncMock(return_value={'items': []})
    profile = AsyncMock(return_value={'id': 'u'})
    recent = AsyncMock(return_value={'items': []})
    tags = AsyncMock(return_value=[{'name': 'rock', 'count': 5}])
    access = AsyncMock(return_value='access')
    player = AsyncMock(return_value=None)
    for name, mock in [('get_top_artists', artists), ('get_top_tracks', tracks),
                       ('get_current_user', profile), ('get_recently_played', recent),
                       ('get_valid_access_token', access), ('get_player_state', player)]:
        monkeypatch.setattr(spotify, name, mock)
    monkeypatch.setattr(lastfm, 'get_artist_tags', tags)
    db = TokenDB(token())
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
    app.dependency_overrides[get_db] = lambda: db
    redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    try:
        with TestClient(app) as client:
            app.state.data_cache = DataCache(redis)
            for _ in range(2):
                for path in ['/spotify/me', '/spotify/recently-played', '/analytics/overview',
                             '/analytics/artists', '/analytics/genres', '/analytics/tracks',
                             '/spotify/top-artists', '/spotify/top-tracks', '/spotify/player']:
                    response = client.get(path, headers={'Origin': 'http://localhost:5173'})
                    assert response.status_code == 200, response.text
                    assert response.headers['X-Data-Stale'] == 'false'
                    assert response.headers['Cache-Control'] == 'no-store'
                    assert 'X-Data-Stale' in response.headers['access-control-expose-headers']
                    if path == '/spotify/top-artists':
                        assert response.json()['items'][0]['id'] == 'a'
                    if path == '/spotify/player':
                        assert response.json() == {'is_playing': False, 'track': None, 'progress_ms': None, 'device': None}
            assert artists.await_count == tracks.await_count == profile.await_count == recent.await_count == tags.await_count == 1
            assert player.await_count == 1
            assert len([route for route in spotify_router.routes if getattr(route, 'path', '') == '/spotify/recently-played']) == 1
    finally:
        app.dependency_overrides.clear()


def test_oauth_callback_seeds_profile_and_preserves_analytics(monkeypatch):
    from app.models.user import User
    profile = AsyncMock(return_value={'id': 'spotify-user', 'display_name': 'Listener'})
    monkeypatch.setattr(spotify, 'get_current_user', profile)

    async def exchange(*args, **kwargs):
        return httpx.Response(200, json={'access_token': 'spotify-access',
                                        'refresh_token': 'spotify-refresh', 'expires_in': 3600})

    monkeypatch.setattr(httpx.AsyncClient, 'post', exchange)
    user = SimpleNamespace(id=1, spotify_user_id='spotify-user')

    class OAuthDB(TokenDB):
        def query(self, model):
            self.model = model
            return self

        def first(self):
            return user if self.model is User else self.token

    db = OAuthDB(token())
    redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        with TestClient(app) as client:
            cache = DataCache(redis)
            app.state.data_cache = cache
            analytics_key = cache.key('spotify', 1, 'top_artists', {'time_range': 'medium_term', 'limit': 20})
            client.portal.call(cache.seed, analytics_key, {'items': []}, 60, 120)
            client.cookies.set('spotify_oauth_state', 'state')
            response = client.get('/auth/spotify/callback?code=code&state=state', follow_redirects=False)
            assert response.status_code == 307
            assert '/auth/callback?token=' in response.headers['location']
            assert db.token.access_token == 'spotify-access'
            assert db.token.refresh_token == 'spotify-refresh'
            assert client.get('/spotify/me').json()['display_name'] == 'Listener'
            assert profile.await_count == 1
            assert client.portal.call(cache.read, analytics_key, 120).payload == {'items': []}
    finally:
        app.dependency_overrides.clear()


def test_private_routes_require_authentication():
    with TestClient(app) as client:
        response = client.get('/analytics/overview')
        assert response.status_code in (401, 403)
        assert response.headers['Cache-Control'] == 'no-store'


@pytest.mark.anyio
async def test_transport_timeout_and_authentication(monkeypatch):
    async def timeout(*args, **kwargs):
        raise httpx.ReadTimeout('timeout')
    monkeypatch.setattr(httpx.AsyncClient, 'request', timeout)
    with pytest.raises(UpstreamError) as error:
        await spotify.get_current_user('token')
    assert error.value.status == 502


@pytest.mark.anyio
async def test_oauth_respects_app_cooldown_and_keeps_analytics(monkeypatch):
    redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    cache = DataCache(redis)
    profile = AsyncMock(return_value={'id': 'u'})
    monkeypatch.setattr(spotify, 'get_current_user', profile)
    key = cache.key('spotify', 1, 'top_artists', {'limit': 20})
    await cache.seed(key, {'items': []}, 60, 120)
    result = await oauth_profile(cache, 'new-token')
    await cache.seed(cache.key('spotify', 1, 'profile'), result, 3600, 86400)
    assert (await cache.read(key, 120)).payload == {'items': []}
    await cache.extend_cooldown(spotify_cooldown_key(), 60)
    with pytest.raises(HTTPException) as error:
        await oauth_profile(cache, 'new-token')
    assert error.value.status_code == 429
    assert profile.await_count == 1
    await redis.aclose()
