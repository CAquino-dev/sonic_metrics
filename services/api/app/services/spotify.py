from datetime import datetime, timedelta, timezone

import httpx


SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


async def get_current_user(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE_URL}/me",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Spotify /me request failed: {response.status_code}"
        )

    return response.json()


async def refresh_access_token(
    client_id: str,
    client_secret: str,
    refresh_token: str,
) -> dict:
    token_data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            data=token_data,
            auth=(
                client_id,
                client_secret,
            ),
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Spotify token refresh failed: {response.status_code}"
        )

    return response.json()


async def get_valid_access_token(
    spotify_token,
    client_id: str,
    client_secret: str,
) -> str:
    now = datetime.now(timezone.utc)

    # Token is still valid
    if spotify_token.expires_at > now:
        return spotify_token.access_token

    # Token has expired, so refresh it
    tokens = await refresh_access_token(
        client_id=client_id,
        client_secret=client_secret,
        refresh_token=spotify_token.refresh_token,
    )

    spotify_token.access_token = tokens["access_token"]

    # Calculate the new expiration time
    spotify_token.expires_at = now + timedelta(
        seconds=tokens["expires_in"]
    )

    # Spotify may provide a new refresh token
    if "refresh_token" in tokens:
        spotify_token.refresh_token = tokens["refresh_token"]

    return spotify_token.access_token

async def get_spotify_profile(
    access_token: str,
) -> dict:
    return await get_current_user(access_token)

async def get_top_artists(
    access_token: str,
    time_range: str = "medium_term",
    limit: int = 20,
) -> dict:
    params = {
        "time_range": time_range,
        "limit": limit,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE_URL}/me/top/artists",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            params=params,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Spotify top artists request failed: "
            f"{response.status_code} - {response.text}"
        )

    return response.json()

async def get_top_tracks(
    access_token: str,
    time_range: str = "medium_term",
    limit: int = 20,
) -> dict:
    params = {
        "time_range": time_range,
        "limit": limit,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE_URL}/me/top/tracks",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            params=params,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Spotify top tracks request failed: "
            f"{response.status_code} - {response.text}"
        )

    return response.json()


async def get_recently_played(
    access_token: str,
    limit: int = 20,
) -> dict:
    params = {
        "limit": limit,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE_URL}/me/player/recently-played",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            params=params,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Spotify recently played request failed: "
            f"{response.status_code} - {response.text}"
        )

    return response.json()