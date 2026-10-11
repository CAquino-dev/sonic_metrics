"""Shared JSON cache, distributed fetch locks, and provider cooldowns."""
import asyncio
import hashlib
import json
import logging
import math
import secrets
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import HTTPException
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)
RELEASE = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0"
EXTEND = "local ttl = redis.call('pttl', KEYS[1]); if ttl < tonumber(ARGV[1]) then redis.call('psetex', KEYS[1], ARGV[1], '1') end return 1"


def retry_delay(value):
    try:
        delay = int(value)
        if delay >= 0:
            return delay
    except (ValueError, TypeError):
        pass
    return 60


class UpstreamError(Exception):
    def __init__(self, status, retry_after=None):
        self.status = status
        self.retry_after = retry_after


@dataclass
class CachedResult:
    payload: object
    fetched_at: float
    stale: bool = False


class DataCache:
    def __init__(self, redis, clock=time.time, wait_seconds=12):
        self.redis = redis
        self.clock = clock
        self.wait_seconds = wait_seconds

    @staticmethod
    def key(provider, owner, resource, params=None):
        query = json.dumps(params or {}, sort_keys=True, separators=(',', ':'))
        digest = hashlib.sha256(query.encode()).hexdigest()
        return f"sonic:v1:{provider}:{owner}:{resource}:{digest}"

    @staticmethod
    def resource_label(key):
        parts = key.split(':')
        return parts[4] if key.startswith('sonic:v1:') and len(parts) > 4 else 'data'

    def result(self, key, entry):
        event = 'cache_stale' if entry.stale else 'cache_hit'
        logger.info('%s resource=%s', event, self.resource_label(key))
        return entry

    async def command(self, method, *args, **kwargs):
        try:
            return await getattr(self.redis, method)(*args, **kwargs)
        except (RedisError, OSError):
            logger.warning("redis_failure operation=%s", method)
            raise HTTPException(503, "Data cache is unavailable.", headers={"Retry-After": "2"}) from None

    async def read(self, key, max_age):
        raw = await self.command('get', key)
        if raw is None:
            return None
        entry = json.loads(raw)
        now = self.clock()
        if now >= entry['fetched_at'] + max_age:
            return None
        return CachedResult(entry['payload'], entry['fetched_at'], now >= entry['fresh_until'])

    async def seed(self, key, payload, fresh, max_age):
        now = self.clock()
        entry = {'payload': payload, 'fetched_at': now, 'fresh_until': now + fresh}
        await self.command('set', key, json.dumps(entry), ex=max_age)
        return CachedResult(payload, now)

    async def cooldown(self, key):
        ttl = await self.command('pttl', key)
        return max(0, math.ceil(ttl / 1000))

    async def extend_cooldown(self, key, seconds):
        await self.command('eval', EXTEND, 1, key, int(seconds * 1000))

    async def load_bounded(self, loader):
        # Token-lock wait plus refresh and resource calls must fit the fetch lease.
        try:
            async with asyncio.timeout(25):
                return await loader()
        except TimeoutError:
            raise UpstreamError(502) from None

    @asynccontextmanager
    async def lock(self, key):
        owner = secrets.token_hex(16)
        acquired = await self.command('set', key, owner, nx=True, ex=30)
        try:
            yield bool(acquired)
        finally:
            if acquired:
                await self.command('eval', RELEASE, 1, key, owner)

    async def get(self, key, fresh, max_age, loader, cooldown_key=None):
        deadline = time.monotonic() + self.wait_seconds
        while True:
            entry = await self.read(key, max_age)
            if entry is not None and not entry.stale:
                return self.result(key, entry)
            remaining = await self.cooldown(cooldown_key) if cooldown_key else 0
            failed = await self.cooldown(key + ':failure')
            if remaining or failed:
                if entry is not None:
                    return self.result(key, entry)
                raise HTTPException(429 if remaining else 502, 'Upstream data temporarily unavailable.',
                                    headers={'Retry-After': str(remaining or failed)})
            async with self.lock(key + ':lock') as acquired:
                if acquired:
                    entry = await self.read(key, max_age)
                    if entry is not None and not entry.stale:
                        return self.result(key, entry)
                    # Another key may have activated the app-wide cooldown while we waited.
                    remaining = await self.cooldown(cooldown_key) if cooldown_key else 0
                    if remaining:
                        if entry is not None:
                            return self.result(key, entry)
                        raise HTTPException(429, 'Spotify is rate limited.', headers={'Retry-After': str(remaining)})
                    logger.info('cache_miss resource=%s', self.resource_label(key))
                    try:
                        payload = await self.load_bounded(loader)
                    except UpstreamError as exc:
                        # A previously eligible value may have aged out during the request.
                        entry = await self.read(key, max_age)
                        if exc.status == 429 and cooldown_key:
                            delay = retry_delay(exc.retry_after)
                            await self.extend_cooldown(cooldown_key, delay + 1)
                            logger.warning('upstream_cooldown seconds=%s', delay + 1)
                            if entry is not None:
                                return self.result(key, entry)
                            raise HTTPException(429, 'Spotify is rate limited.', headers={'Retry-After': str(await self.cooldown(cooldown_key))}) from None
                        if exc.status >= 500:
                            await self.extend_cooldown(key + ':failure', 30)
                            if entry is not None:
                                return self.result(key, entry)
                        status = 401 if exc.status in (401, 403) else 502
                        raise HTTPException(status, 'Upstream data request failed.') from None
                    return await self.seed(key, payload, fresh, max_age)
                if entry is not None:
                    return self.result(key, entry)
            if time.monotonic() >= deadline:
                raise HTTPException(503, 'Data refresh is in progress.', headers={'Retry-After': '2'})
            await asyncio.sleep(0.05)
