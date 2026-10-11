import asyncio
import os
import secrets

import fakeredis.aioredis
import pytest
from fastapi import HTTPException
from redis.asyncio import Redis
from redis.exceptions import ConnectionError

from app.services.cache import DataCache, UpstreamError, RELEASE


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture
async def cache():
    redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    now = [1000.0]
    result = DataCache(redis, clock=lambda: now[0], wait_seconds=0.2)
    result.now = now
    yield result
    await redis.aclose()


@pytest.mark.anyio
@pytest.mark.parametrize('payload', [None, [], {'items': []}])
async def test_hits_and_expiration(cache, payload):
    calls = 0

    async def load():
        nonlocal calls
        calls += 1
        return payload

    key = cache.key('spotify', 1, 'top_artists', {'limit': 20})
    assert (await cache.get(key, 60, 120, load)).payload == payload
    assert (await cache.get(key, 60, 120, load)).payload == payload
    assert calls == 1
    cache.now[0] += 61
    assert not (await cache.get(key, 60, 120, load)).stale
    assert calls == 2


@pytest.mark.anyio
async def test_two_instances_coalesce_cold_requests(cache):
    other = DataCache(cache.redis, clock=cache.clock)
    calls = 0

    async def load():
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.08)
        return {'items': []}

    results = await asyncio.gather(*[
        (cache if i % 2 else other).get('shared', 60, 120, load) for i in range(12)])
    assert calls == 1
    assert all(result.payload == {'items': []} for result in results)


@pytest.mark.anyio
async def test_stale_during_refresh_and_failure(cache):
    await cache.seed('data', {'old': True}, 10, 60)
    cache.now[0] += 11
    async with cache.lock('data:lock'):
        result = await cache.get('data', 10, 60, lambda: pytest.fail('must not fetch'))
        assert result.stale

    async def fail():
        raise UpstreamError(502)

    assert (await cache.get('data', 10, 60, fail)).stale
    assert (await cache.get('data', 10, 60, lambda: pytest.fail('suppressed'))).stale
    cache.now[0] += 60
    with pytest.raises(HTTPException) as error:
        await cache.get('data', 10, 60, fail)
    assert error.value.status_code == 502


@pytest.mark.anyio
@pytest.mark.parametrize('retry_after, expected', [('4', 5), (None, 61), ('invalid', 61), ('-1', 61)])
async def test_app_cooldown_blocks_other_keys(cache, retry_after, expected):
    async def limited():
        raise UpstreamError(429, retry_after)

    with pytest.raises(HTTPException) as error:
        await cache.get('user1', 10, 60, limited, 'app-cooldown')
    assert error.value.status_code == 429
    assert int(error.value.headers['Retry-After']) == expected
    await cache.seed('user2', [], 10, 60)
    cache.now[0] += 11
    assert (await cache.get('user2', 10, 60, limited, 'app-cooldown')).stale
    with pytest.raises(HTTPException) as error:
        await cache.get('user3', 10, 60, lambda: pytest.fail('cooldown bypass'), 'app-cooldown')
    assert error.value.status_code == 429
    await cache.extend_cooldown('app-cooldown', 1)
    assert await cache.cooldown('app-cooldown') == expected
    await cache.redis.delete('app-cooldown')
    assert (await cache.get('user3', 10, 60, async_empty, 'app-cooldown')).payload == []


async def async_empty():
    return []


@pytest.mark.anyio
@pytest.mark.parametrize('status', [400, 401, 403, 404])
async def test_no_stale_for_permanent_or_auth_errors(cache, status):
    await cache.seed('data', [], 10, 60)
    cache.now[0] += 11
    async def fail():
        raise UpstreamError(status)
    with pytest.raises(HTTPException) as error:
        await cache.get('data', 10, 60, fail)
    assert error.value.status_code == (401 if status in (401, 403) else 502)
    assert await cache.redis.get('data:failure') is None


@pytest.mark.anyio
async def test_owner_safe_release_and_wait_timeout(cache):
    async with cache.lock('lock'):
        await cache.redis.set('lock', 'new-owner', ex=30)
    assert await cache.redis.get('lock') == 'new-owner'
    await cache.redis.set('cold:lock', 'crashed-worker', ex=30)
    with pytest.raises(HTTPException) as error:
        await cache.get('cold', 10, 60, lambda: pytest.fail('lock bypass'))
    assert error.value.status_code == 503
    assert error.value.headers['Retry-After'] == '2'
    await cache.redis.delete('cold:lock')
    await cache.get('cold', 10, 60, async_empty)


@pytest.mark.anyio
async def test_redis_failure_never_calls_provider(cache, monkeypatch):
    async def fail(*args, **kwargs):
        raise ConnectionError('offline')
    monkeypatch.setattr(cache.redis, 'get', fail)
    with pytest.raises(HTTPException) as error:
        await cache.get('data', 10, 60, lambda: pytest.fail('redis bypass'))
    assert error.value.status_code == 503


@pytest.mark.anyio
async def test_stale_value_ages_out_while_upstream_fails(cache):
    await cache.seed('data', {'old': True}, 10, 20)
    cache.now[0] += 11

    async def fail():
        cache.now[0] += 10
        raise UpstreamError(502)

    with pytest.raises(HTTPException) as error:
        await cache.get('data', 10, 20, fail)
    assert error.value.status_code == 502


def test_keys_separate_users_and_parameters():
    key = DataCache.key
    assert key('spotify', 1, 'top', {'limit': 20, 'time_range': 'short_term'}) == key('spotify', 1, 'top', {'time_range': 'short_term', 'limit': 20})
    assert len({key('spotify', user, 'top', {'limit': limit, 'time_range': time_range})
                for user in (1, 2) for limit in (20, 50) for time_range in ('short_term', 'long_term')}) == 8


@pytest.mark.anyio
async def test_real_redis_coordination():
    url = os.getenv('TEST_REDIS_URL')
    if not url:
        pytest.skip('Set TEST_REDIS_URL to run against a real Redis server')
    redis1 = Redis.from_url(url, decode_responses=True)
    redis2 = Redis.from_url(url, decode_responses=True)
    key = 'sonic:test:' + secrets.token_hex(12)
    calls = 0
    async def load():
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.08)
        return {'ok': True}
    try:
        first, second = DataCache(redis1), DataCache(redis2)
        await asyncio.gather(first.get(key, 10, 60, load), second.get(key, 10, 60, load))
        assert calls == 1
        await redis1.aclose()
        redis1 = Redis.from_url(url, decode_responses=True)
        assert (await DataCache(redis1).get(key, 10, 60, load)).payload == {'ok': True}
        assert calls == 1
        await redis1.set(key + ':lock', 'replacement', ex=30)
        assert await redis2.eval(RELEASE, 1, key + ':lock', 'former') == 0
    finally:
        await redis2.delete(key, key + ':lock')
        await redis1.aclose()
        await redis2.aclose()
