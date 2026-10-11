# Sonic Metrics

React web client (`apps/web`), FastAPI backend (`services/api`), PostgreSQL,
and Redis. `apps/frontend` contains an Expo starter application.

## Local backend

Start Docker, then run from the repository root:

```powershell
docker compose up -d postgres redis
```

From `services/api`, copy `.env.example` to `.env` if you do not already have
one. Fill in your Spotify credentials, Last.fm key, and a random JWT secret.
Existing environments only need `REDIS_URL`; cache lifetimes have defaults.
Register the exact `SPOTIFY_REDIRECT_URI` with Spotify.

```powershell
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Run the web client from `apps/web` with `npm install` and `npm run dev`.

## Shared data cache

All Spotify and analytics routes share cached upstream responses in Redis.
Keys isolate Spotify users, resources, time ranges, and limits. Last.fm artist
tags are shared by normalized artist name and limit. Tokens remain in PostgreSQL;
neither access tokens nor refresh tokens are stored in cache keys or payloads.

| Resource | Fresh lifetime | Maximum age during failures |
| --- | --- | --- |
| Profile, top artists/tracks, artist details | 1 hour | 24 hours |
| Recently played | 2 minutes | 15 minutes |
| Player state (including inactive) | 10 seconds | 30 seconds |
| Last.fm tags | 24 hours | 7 days |

Override the `CACHE_*_FRESH_SECONDS` and `CACHE_*_MAX_AGE_SECONDS` variables in
`.env.example`. Maximum ages must be at least their fresh lifetimes. Data refreshes
only when requested; login and logout do not clear analytics. OAuth still verifies
identity with Spotify and seeds the profile cache from that response.

Redis locks coordinate concurrent requests across workers. Fresh hits skip Spotify
token refresh. Concurrent requests may receive eligible stale data while another
request refreshes it. Spotify `429` responses activate an app-wide cooldown honoring
`Retry-After` plus one second (61 seconds if missing/invalid). Eligible stale data
is served during cooldowns, timeouts, and upstream server failures. With no usable
data, rate limits return `429`; other upstream failures return `502`. Redis outages
return `503` rather than sending uncontrolled upstream traffic. Requests without
cached data wait at most 12 seconds for another fetch, then return `503` with
`Retry-After: 2`. Authentication failures are never masked with stale data.

Successful data responses retain their JSON shapes and add `X-Data-Fetched-At`
(UTC timestamp) and `X-Data-Stale` (`true`/`false`). Aggregates report the oldest
source timestamp and mark stale if any source is stale. Private responses use
`Cache-Control: no-store`; data freshness headers and `Retry-After` are exposed by
CORS. The UI does not yet display these headers.

Redis uses AOF and the `redis_data` Docker volume to survive restarts. Deploy Redis
before updating the backend and set `REDIS_URL` to the shared instance on every
worker. Avoid exposing Redis publicly. No PostgreSQL schema migration is introduced
by caching. Removing Docker volumes clears persisted cache data.

## Validation and monitoring

From `services/api`:

```powershell
uv run python -m pytest -p no:cacheprovider
```

Tests mock providers and use in-memory Redis with Lua support. To also run the real
Redis integration test against a local Redis service:

```powershell
$env:TEST_REDIS_URL = "redis://127.0.0.1:6379/1"
uv run python -m pytest -p no:cacheprovider
```

That test uses randomly named keys and deletes only its own keys; it does not flush
the database. It verifies shared locks and cache reuse after reconnecting clients.
To check server persistence manually, warm the dashboard, restart Redis with
`docker compose restart redis`, and reload it before freshness expires.

Enable INFO logging for `app.services.cache`, `app.services.spotify`, and
`app.services.lastfm` to count `cache_hit`, `cache_miss`, `cache_stale`,
`upstream_call`, `upstream_cooldown`, and `redis_failure` events. Logs omit tokens,
payloads, and user identities. After one dashboard load, repeated navigation and
reloads within matching freshness windows should add no Spotify upstream calls.
Recently played and player state refresh sooner than hourly analytics. Monitor
Spotify request counts and cooldown events after rollout; caching reduces rate
limits but cannot guarantee that the app never reaches Spotify's quota.
