import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.models.spotify_token import SpotifyToken
from app.models.user import User
from app.services.spotify import get_current_user as get_spotify_user
from app.services.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

SPOTIFY_SCOPES = "user-read-private user-read-email"


@router.get("/spotify/login")
def spotify_login():
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "scope": SPOTIFY_SCOPES,
        "state": state,
    }

    spotify_url = f"{SPOTIFY_AUTHORIZE_URL}?{urlencode(params)}"

    response = RedirectResponse(url=spotify_url)

    response.set_cookie(
        key="spotify_oauth_state",
        value=state,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=600,
    )

    return response


@router.get("/spotify/callback")
async def spotify_callback(
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    stored_state = request.cookies.get("spotify_oauth_state")

    if not stored_state or not secrets.compare_digest(
        state,
        stored_state,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state.",
        )

    token_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.spotify_redirect_uri,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            data=token_data,
            auth=(
                settings.spotify_client_id,
                settings.spotify_client_secret,
            ),
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Failed to exchange Spotify authorization code.",
        )

    tokens = response.json()

    spotify_user = await get_spotify_user(
        tokens["access_token"]
    )

    user = (
        db.query(User)
        .filter(
            User.spotify_user_id == spotify_user["id"]
        )
        .first()
    )

    if user is None:
        user = User(
            spotify_user_id=spotify_user["id"],
            display_name=spotify_user.get("display_name"),
            email=spotify_user.get("email"),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # Calculate when the access token expires
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=tokens["expires_in"]
    )

    # Check if this user already has Spotify tokens
    spotify_token = (
        db.query(SpotifyToken)
        .filter(
            SpotifyToken.user_id == user.id
        )
        .first()
    )

    if spotify_token is None:
        spotify_token = SpotifyToken(
            user_id=user.id,
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_at=expires_at,
        )

        db.add(spotify_token)

    else:
        spotify_token.access_token = tokens["access_token"]
        spotify_token.refresh_token = tokens["refresh_token"]
        spotify_token.expires_at = expires_at

    db.commit()

    # Create a Sonic Metrics JWT
    access_token = create_access_token(
        user_id=user.id
    )

    # Return the JWT to the client
    response = JSONResponse(
        content={
            "message": "Spotify authentication successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "spotify_user_id": user.spotify_user_id,
                "display_name": user.display_name,
                "email": user.email,
            },
        }
    )

    # Remove the OAuth state cookie
    response.delete_cookie(
        key="spotify_oauth_state"
    )

    return response