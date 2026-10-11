"""Deterministic test settings; never use developer secrets or live providers."""
import os

for key, value in {
    'APP_NAME': 'Sonic Metrics tests', 'ENVIRONMENT': 'development',
    'DATABASE_URL': 'sqlite://', 'JWT_SECRET_KEY': 'test-secret-only',
    'JWT_ALGORITHM': 'HS256', 'JWT_ACCESS_TOKEN_EXPIRE_MINUTES': '60',
    'SPOTIFY_CLIENT_ID': 'test-client', 'SPOTIFY_CLIENT_SECRET': 'test-secret',
    'SPOTIFY_REDIRECT_URI': 'http://testserver/auth/spotify/callback',
    'LASTFM_API_KEY': 'test-key',
}.items():
    os.environ[key] = value
