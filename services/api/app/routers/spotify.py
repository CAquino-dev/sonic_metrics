from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.models.spotify_token import SpotifyToken
from app.models.user import User
from app.services.dependencies import get_current_user
from app.services.spotify import (
    get_current_user as get_spotify_user,
    get_valid_access_token,
    get_top_artists,
    get_top_tracks,
    get_recently_played,
    get_artist,
    )

from app.services.lastfm import get_artist_tags
from app.services.genre_normalizer import normalize_genre

router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.get("/me")
async def spotify_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find the current user's Spotify tokens
    spotify_token = (
        db.query(SpotifyToken)
        .filter(
            SpotifyToken.user_id == current_user.id
        )
        .first()
    )

    if spotify_token is None:
        raise HTTPException(
            status_code=404,
            detail="Spotify account is not connected.",
        )

    try:
        # Get a valid Spotify access token.
        # This automatically refreshes it if expired.
        access_token = await get_valid_access_token(
            spotify_token=spotify_token,
            client_id=settings.spotify_client_id,
            client_secret=settings.spotify_client_secret,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to refresh Spotify access token.",
        ) from exc

    # Save any token changes caused by a refresh
    db.commit()

    try:
        # Get the user's profile from Spotify
        spotify_user = await get_spotify_user(
            access_token
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve Spotify profile.",
        ) from exc

    return {
        "id": spotify_user.get("id"),
        "display_name": spotify_user.get("display_name"),
        "email": spotify_user.get("email"),
        "spotify_product": spotify_user.get("product"),
        "country": spotify_user.get("country"),
    }

@router.get("/top-artists")
async def top_artists(
    time_range: str = Query(
        default="medium_term",
        pattern="^(short_term|medium_term|long_term)$",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=50,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find the user's Spotify token
    spotify_token = (
        db.query(SpotifyToken)
        .filter(
            SpotifyToken.user_id == current_user.id
        )
        .first()
    )

    if spotify_token is None:
        raise HTTPException(
            status_code=404,
            detail="Spotify account is not connected.",
        )

    # Get a valid Spotify access token
    try:
        access_token = await get_valid_access_token(
            spotify_token=spotify_token,
            client_id=settings.spotify_client_id,
            client_secret=settings.spotify_client_secret,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to refresh Spotify access token.",
        ) from exc

    # Save refreshed token information
    db.commit()

    # Get top artists from Spotify
    try:
        data = await get_top_artists(
            access_token=access_token,
            time_range=time_range,
            limit=limit,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    # Return only the information Sonic Metrics needs
    return {
        "time_range": time_range,
        "limit": limit,
        "items": [
            {
                "id": artist["id"],
                "name": artist["name"],
                "genres": artist.get("genres", []),
                "popularity": artist.get("popularity"),
                "followers": artist.get(
                    "followers",
                    {},
                ).get("total"),
                "images": artist.get("images", []),
            }
            for artist in data.get("items", [])
        ],
    }

@router.get("/top-tracks")
async def top_tracks(
    time_range: str = Query(
        default="medium_term",
        pattern="^(short_term|medium_term|long_term)$",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=50,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find the user's Spotify token
    spotify_token = (
        db.query(SpotifyToken)
        .filter(
            SpotifyToken.user_id == current_user.id
        )
        .first()
    )

    if spotify_token is None:
        raise HTTPException(
            status_code=404,
            detail="Spotify account is not connected.",
        )

    # Get a valid Spotify access token
    try:
        access_token = await get_valid_access_token(
            spotify_token=spotify_token,
            client_id=settings.spotify_client_id,
            client_secret=settings.spotify_client_secret,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to refresh Spotify access token.",
        ) from exc

    # Save refreshed token information
    db.commit()

    # Get top tracks from Spotify
    try:
        data = await get_top_tracks(
            access_token=access_token,
            time_range=time_range,
            limit=limit,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve top tracks from Spotify.",
        ) from exc

    # Return only the information Sonic Metrics needs
    return {
        "time_range": time_range,
        "limit": limit,
        "items": [
            {
                "id": track["id"],
                "name": track["name"],
                "duration_ms": track.get("duration_ms"),
                "popularity": track.get("popularity"),
                "explicit": track.get("explicit"),
                "artists": [
                    {
                        "id": artist["id"],
                        "name": artist["name"],
                    }
                    for artist in track.get("artists", [])
                ],
                "album": {
                    "id": track["album"]["id"],
                    "name": track["album"]["name"],
                    "images": track["album"].get("images", []),
                },
            }
            for track in data.get("items", [])
        ],
    }

@router.get("/recently-played")
async def recently_played(
    limit: int = Query(
        default=20,
        ge=1,
        le=50,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find the user's Spotify token
    spotify_token = (
        db.query(SpotifyToken)
        .filter(
            SpotifyToken.user_id == current_user.id
        )
        .first()
    )

    if spotify_token is None:
        raise HTTPException(
            status_code=404,
            detail="Spotify account is not connected.",
        )

    # Get a valid Spotify access token
    try:
        access_token = await get_valid_access_token(
            spotify_token=spotify_token,
            client_id=settings.spotify_client_id,
            client_secret=settings.spotify_client_secret,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to refresh Spotify access token.",
        ) from exc

    # Save refreshed token information
    db.commit()

    # Get recently played tracks from Spotify
    try:
        data = await get_recently_played(
            access_token=access_token,
            limit=limit,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve recently played tracks from Spotify.",
        ) from exc

    # Return the information Sonic Metrics needs
    return {
        "limit": limit,
        "items": [
            {
                "played_at": item.get("played_at"),
                "track": {
                    "id": item["track"]["id"],
                    "name": item["track"]["name"],
                    "duration_ms": item["track"].get("duration_ms"),
                    "explicit": item["track"].get("explicit"),
                    "artists": [
                        {
                            "id": artist["id"],
                            "name": artist["name"],
                        }
                        for artist in item["track"].get(
                            "artists",
                            [],
                        )
                    ],
                    "album": {
                        "id": item["track"]["album"]["id"],
                        "name": item["track"]["album"]["name"],
                        "images": item["track"]["album"].get(
                            "images",
                            [],
                        ),
                    },
                },
            }
            for item in data.get("items", [])
        ],
    }
@router.get("/genres")
async def spotify_genres(
    time_range: str = Query(
        default="medium_term",
        pattern="^(short_term|medium_term|long_term)$",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=50,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    spotify_token = (
        db.query(SpotifyToken)
        .filter(
            SpotifyToken.user_id == current_user.id
        )
        .first()
    )

    if spotify_token is None:
        raise HTTPException(
            status_code=404,
            detail="Spotify account is not connected.",
        )

    try:
        access_token = await get_valid_access_token(
            spotify_token=spotify_token,
            client_id=settings.spotify_client_id,
            client_secret=settings.spotify_client_secret,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to refresh Spotify access token.",
        ) from exc

    db.commit()

    try:
        top_artists = await get_top_artists(
            access_token=access_token,
            time_range=time_range,
            limit=limit,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve top artists from Spotify.",
        ) from exc

    genre_counts: dict[str, int] = {}

    for artist in top_artists.get("items", []):
        artist_name = artist.get("name")

        if not artist_name:
            continue

        try:
            tags = await get_artist_tags(
                artist_name=artist_name,
                limit=10,
            )
        except RuntimeError as exc:
            raise HTTPException(
                status_code=502,
                detail="Failed to retrieve artist tags from Last.fm.",
            ) from exc

        for tag in tags:
            tag_name = tag.get("name")

            if not tag_name:
                continue

            genre = normalize_genre(tag_name)

            if genre is None:
                continue

            genre_counts[genre] = (
                genre_counts.get(genre, 0) + 1
            )

    sorted_genres = sorted(
        genre_counts.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    return {
        "time_range": time_range,
        "artist_limit": limit,
        "genres": [
            {
                "genre": genre,
                "artist_count": count,
            }
            for genre, count in sorted_genres
        ],
    }

@router.get("/artist-tags")
async def artist_tags(
    artist: str = Query(..., min_length=1),
):
    try:
        tags = await get_artist_tags(artist_name=artist)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve artist tags from Last.fm.",
        ) from exc

    return {
        "artist": artist,
        "tags": tags,
    }