from pydantic import Field
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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()