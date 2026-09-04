from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.spotify_token import SpotifyToken
from app.models.user import User
from app.config.settings import settings
from app.services.dependencies import get_current_user
from app.services.spotify import (
    get_top_artists,
    get_top_tracks,
    get_valid_access_token,
)
from app.services.lastfm import get_artist_tags
from app.services.genre_normalizer import normalize_genre


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get("/overview")
async def analytics_overview(
    time_range: str = Query(
        default="medium_term",
        pattern="^(short_term|medium_term|long_term)$",
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
            limit=20,
        )

        top_tracks = await get_top_tracks(
            access_token=access_token,
            time_range=time_range,
            limit=20,
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve Spotify analytics data.",
        ) from exc

    artists = top_artists.get("items", [])
    tracks = top_tracks.get("items", [])

    genre_counts: dict[str, int] = {}

    for artist in artists:
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

    top_artist = artists[0] if artists else None
    top_track = tracks[0] if tracks else None
    top_genre = sorted_genres[0] if sorted_genres else None

    return {
        "time_range": time_range,

        "top_artist": (
            {
                "id": top_artist.get("id"),
                "name": top_artist.get("name"),
                "images": top_artist.get("images", []),
            }
            if top_artist
            else None
        ),

        "top_track": (
            {
                "id": top_track.get("id"),
                "name": top_track.get("name"),
                "artists": [
                    {
                        "id": artist.get("id"),
                        "name": artist.get("name"),
                    }
                    for artist in top_track.get(
                        "artists",
                        [],
                    )
                ],
                "album": {
                    "id": top_track["album"].get("id"),
                    "name": top_track["album"].get("name"),
                    "images": top_track["album"].get(
                        "images",
                        [],
                    ),
                },
            }
            if top_track
            else None
        ),

        "top_genre": (
            {
                "genre": top_genre[0],
                "artist_count": top_genre[1],
            }
            if top_genre
            else None
        ),

        "artist_count": len(artists),
        "track_count": len(tracks),
        "genre_count": len(sorted_genres),
    }

@router.get("/artists")
async def analytics_artists(
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
        data = await get_top_artists(
            access_token=access_token,
            time_range=time_range,
            limit=limit,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve top artists from Spotify.",
        ) from exc

    spotify_artists = data.get("items", [])

    artists = []

    for rank, artist in enumerate(spotify_artists, start=1):
        artist_name = artist.get("name")

        genres = []

        if artist_name:
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

                if genre and genre not in genres:
                    genres.append(genre)

        artists.append(
            {
                "rank": rank,
                "id": artist.get("id"),
                "name": artist.get("name"),
                "images": artist.get("images", []),
                "genres": genres[:5],
            }
        )

    return {
        "time_range": time_range,
        "limit": limit,
        "total_artists": len(artists),
        "artists": artists,
    }

@router.get("/tracks")
async def analytics_tracks(
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

    spotify_tracks = data.get("items", [])

    tracks = []

    for rank, track in enumerate(spotify_tracks, start=1):
        tracks.append(
            {
                "rank": rank,
                "id": track.get("id"),
                "name": track.get("name"),
                "duration_ms": track.get("duration_ms"),
                "explicit": track.get("explicit", False),
                "artists": [
                    {
                        "id": artist.get("id"),
                        "name": artist.get("name"),
                    }
                    for artist in track.get("artists", [])
                ],
                "album": {
                    "id": track.get("album", {}).get("id"),
                    "name": track.get("album", {}).get("name"),
                    "images": track.get("album", {}).get("images", []),
                },
                "popularity": track.get("popularity"),
            }
        )

    return {
        "time_range": time_range,
        "limit": limit,
        "total_tracks": len(tracks),
        "tracks": tracks,
    }