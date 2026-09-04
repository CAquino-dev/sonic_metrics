import httpx

from app.config.settings import settings


LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/"


async def get_artist_tags(
    artist_name: str,
    limit: int = 10,
) -> list[dict]:
    params = {
        "method": "artist.getTopTags",
        "artist": artist_name,
        "api_key": settings.lastfm_api_key,
        "format": "json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            LASTFM_API_URL,
            params=params,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Last.fm artist tags request failed: "
            f"{response.status_code} - {response.text}"
        )

    data = response.json()

    tags = data.get("toptags", {}).get("tag", [])

    return [
        {
            "name": tag.get("name"),
            "count": tag.get("count"),
        }
        for tag in tags[:limit]
    ]