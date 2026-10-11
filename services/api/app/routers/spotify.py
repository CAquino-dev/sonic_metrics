from app.services.data import CachedData, get_cached_data
from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.user import User
from app.services.dependencies import get_current_user

from app.services.genre_normalizer import normalize_genre

router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.get("/me")
async def spotify_me(
    current_user: User = Depends(get_current_user),
    data_service: CachedData = Depends(get_cached_data),
):

    try:
        # Get the user's profile from Spotify
        spotify_user = await data_service.spotify(current_user.id, "profile")
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve Spotify profile.",
        ) from exc

    images = spotify_user.get("images", [])

    return {
        "id": spotify_user.get("id"),
        "display_name": spotify_user.get("display_name"),
        "email": spotify_user.get("email"),

        "photo": images[0].get("url") if images else None,

        "followers": spotify_user.get("followers", {}).get(
            "total", 0
        ),

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
    data_service: CachedData = Depends(get_cached_data),
):

    # Get top artists from Spotify
    try:
        data = await data_service.spotify(
            current_user.id, "top_artists",
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
    data_service: CachedData = Depends(get_cached_data),
):

    # Get top tracks from Spotify
    try:
        data = await data_service.spotify(
            current_user.id, "top_tracks",
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
    data_service: CachedData = Depends(get_cached_data),
):

    # Get recently played tracks from Spotify
    try:
        data = await data_service.spotify(
            current_user.id, "recent",
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
    data_service: CachedData = Depends(get_cached_data),
):

    try:
        top_artists = await data_service.spotify(
            current_user.id, "top_artists",
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
            tags = await data_service.tags(
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
    data_service: CachedData = Depends(get_cached_data),
    artist: str = Query(..., min_length=1),
):
    try:
        tags = await data_service.tags(artist_name=artist)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve artist tags from Last.fm.",
        ) from exc

    return {
        "artist": artist,
        "tags": tags,
    }

@router.get("/player")
async def spotify_player(
    current_user: User = Depends(get_current_user),
    data_service: CachedData = Depends(get_cached_data),
):

    try:
        player = await data_service.spotify(
            current_user.id, "player",
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve Spotify player state.",
        ) from exc

    if player is None:
        return {
            "is_playing": False,
            "track": None,
            "progress_ms": None,
            "device": None,
        }

    item = player.get("item")

    if item is None:
        return {
            "is_playing": player.get("is_playing", False),
            "track": None,
            "progress_ms": player.get("progress_ms"),
            "device": None,
        }

    return {
        "is_playing": player.get("is_playing", False),
        "progress_ms": player.get("progress_ms"),
        "track": {
            "id": item.get("id"),
            "name": item.get("name"),
            "duration_ms": item.get("duration_ms"),
            "explicit": item.get("explicit"),
            "artists": [
                {
                    "id": artist["id"],
                    "name": artist["name"],
                }
                for artist in item.get("artists", [])
            ],
            "album": {
                "id": item["album"].get("id"),
                "name": item["album"].get("name"),
                "images": item["album"].get("images", []),
            },
        },
        "device": {
            "id": player["device"].get("id"),
            "name": player["device"].get("name"),
            "type": player["device"].get("type"),
            "volume_percent": player["device"].get(
                "volume_percent"
            ),
        } if player.get("device") else None,
    }