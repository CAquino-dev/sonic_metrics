"""Uncached Spotify transport. Data routes must use CachedData."""
import logging
from datetime import datetime, timedelta, timezone
import httpx
from app.services.cache import UpstreamError

logger = logging.getLogger(__name__)
SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'
SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

async def request(method, url, **kwargs):
    logger.info('upstream_call provider=spotify resource=%s', url.split('?')[0].split('/')[-1])
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.request(method, url, **kwargs)
    except httpx.RequestError:
        raise UpstreamError(502) from None
    if response.status_code == 204:
        return None
    if response.status_code != 200:
        raise UpstreamError(response.status_code, response.headers.get('Retry-After'))
    try:
        return response.json()
    except ValueError:
        raise UpstreamError(502) from None

async def get_current_user(access_token):
    return await get('/me', access_token)

async def get(path, access_token, **params):
    return await request('GET', SPOTIFY_API_BASE_URL + path,
                         headers={'Authorization': f'Bearer {access_token}'}, params=params)

async def refresh_access_token(client_id, client_secret, refresh_token):
    return await request('POST', SPOTIFY_TOKEN_URL,
                         data={'grant_type': 'refresh_token', 'refresh_token': refresh_token},
                         auth=(client_id, client_secret))

async def get_valid_access_token(spotify_token, client_id, client_secret):
    now = datetime.now(timezone.utc)
    if spotify_token.expires_at > now:
        return spotify_token.access_token
    tokens = await refresh_access_token(client_id, client_secret, spotify_token.refresh_token)
    spotify_token.access_token = tokens['access_token']
    spotify_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=tokens['expires_in'])
    if 'refresh_token' in tokens:
        spotify_token.refresh_token = tokens['refresh_token']
    return spotify_token.access_token

async def get_spotify_profile(access_token):
    return await get_current_user(access_token)

async def get_top_artists(access_token, time_range='medium_term', limit=20):
    return await get('/me/top/artists', access_token, time_range=time_range, limit=limit)

async def get_top_tracks(access_token, time_range='medium_term', limit=20):
    return await get('/me/top/tracks', access_token, time_range=time_range, limit=limit)

async def get_artist(access_token, artist_id):
    return await get(f'/artists/{artist_id}', access_token)

async def get_recently_played(access_token, limit=20):
    return await get('/me/player/recently-played', access_token, limit=limit)

async def get_player_state(access_token):
    return await get('/me/player', access_token)
