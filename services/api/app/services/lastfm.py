import logging
import httpx
from app.config.settings import settings
from app.services.cache import UpstreamError

logger = logging.getLogger(__name__)
LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

async def get_artist_tags(artist_name, limit=10):
    logger.info('upstream_call provider=lastfm resource=tags')
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(LASTFM_API_URL, params={
                'method': 'artist.getTopTags', 'artist': artist_name,
                'api_key': settings.lastfm_api_key, 'format': 'json',
            })
    except httpx.RequestError:
        raise UpstreamError(502) from None
    if response.status_code != 200:
        raise UpstreamError(response.status_code)
    try:
        data = response.json()
    except ValueError:
        raise UpstreamError(502) from None
    if 'error' in data:
        raise UpstreamError(502)
    return [{'name': tag.get('name'), 'count': tag.get('count')}
            for tag in data.get('toptags', {}).get('tag', [])[:limit]]
