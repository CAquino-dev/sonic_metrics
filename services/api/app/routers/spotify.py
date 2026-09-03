from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.models.spotify_token import SpotifyToken
from app.models.user import User
from app.services.dependencies import get_current_user
from app.services.spotify import (
    get_current_user as get_spotify_user,
    get_valid_access_token,
)


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