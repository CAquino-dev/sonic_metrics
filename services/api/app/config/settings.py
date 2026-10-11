from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(validation_alias="APP_NAME")
    environment: str = Field(validation_alias="ENVIRONMENT")
    database_url: str = Field(validation_alias="DATABASE_URL")
    jwt_secret_key: str = Field(validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(validation_alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(validation_alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    spotify_client_id: str = Field(validation_alias="SPOTIFY_CLIENT_ID")
    spotify_client_secret: str = Field(validation_alias="SPOTIFY_CLIENT_SECRET")
    spotify_redirect_uri: str = Field(validation_alias="SPOTIFY_REDIRECT_URI")
    lastfm_api_key: str = Field(validation_alias="LASTFM_API_KEY")

    redis_url: str = "redis://127.0.0.1:6379/0"
    cache_profile_fresh_seconds: int = Field(default=3600, gt=0)
    cache_profile_max_age_seconds: int = Field(default=86400, gt=0)
    cache_top_fresh_seconds: int = Field(default=3600, gt=0)
    cache_top_max_age_seconds: int = Field(default=86400, gt=0)
    cache_recent_fresh_seconds: int = Field(default=120, gt=0)
    cache_recent_max_age_seconds: int = Field(default=900, gt=0)
    cache_player_fresh_seconds: int = Field(default=10, gt=0)
    cache_player_max_age_seconds: int = Field(default=30, gt=0)
    cache_artist_fresh_seconds: int = Field(default=3600, gt=0)
    cache_artist_max_age_seconds: int = Field(default=86400, gt=0)
    cache_tags_fresh_seconds: int = Field(default=86400, gt=0)
    cache_tags_max_age_seconds: int = Field(default=604800, gt=0)

    @model_validator(mode='after')
    def validate_cache_ages(self):
        for resource in ('profile', 'top', 'recent', 'player', 'artist', 'tags'):
            if getattr(self, f'cache_{resource}_max_age_seconds') < getattr(self, f'cache_{resource}_fresh_seconds'):
                raise ValueError(f'{resource} maximum cache age must be at least its fresh lifetime')
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
