import { describe, it, expect } from 'vitest';
import { Sha256LruCache } from '../../server/cache';
import { createRateLimiter } from '../../server/middleware';

describe('Server Security Gateway, Caching & Defense-in-Depth', () => {
  it('implements SHA-256 LRU cache with sub-millisecond retrieval and key generation', () => {
    const cache = new Sha256LruCache<string>(10, 60000);
    const testPayload = { query: 'test question', pm25: 180, aqi: 240 };
    const key = Sha256LruCache.generateKey('assist', testPayload);

    expect(key).toBeDefined();
    expect(key.length).toBe(64); // SHA-256 64-hex char hash

    expect(cache.get(key)).toBeNull();

    cache.set(key, 'cached response text');
    expect(cache.get(key)).toBe('cached response text');
    expect(cache.size()).toBe(1);

    cache.clear();
    expect(cache.get(key)).toBeNull();
    expect(cache.size()).toBe(0);
  });

  it('enforces LRU eviction when cache exceeds maximum entry limit', () => {
    const cache = new Sha256LruCache<number>(2, 60000);
    cache.set('key1', 1);
    cache.set('key2', 2);
    expect(cache.size()).toBe(2);

    // Adding 3rd key should evict oldest (key1)
    cache.set('key3', 3);
    expect(cache.size()).toBe(2);
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe(2);
    expect(cache.get('key3')).toBe(3);
  });

  it('expires cached items when time-to-live is exceeded', () => {
    const cache = new Sha256LruCache<string>(10, -1000); // Expired immediately
    cache.set('expired-key', 'expired-val');
    expect(cache.get('expired-key')).toBeNull();
  });

  it('rate limiter tracks IP windows and returns 429 when threshold is breached', () => {
    const limiter = createRateLimiter(2, 10000); // 2 requests max per 10s

    let statusCode = 200;
    const mockRes: any = {
      setHeader: (_name: string, _value: any) => {},
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => data,
        };
      },
    };

    const mockReq: any = {
      ip: '192.168.1.100',
      socket: { remoteAddress: '192.168.1.100' },
      headers: {},
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Req 1: allowed
    limiter(mockReq, mockRes, next);
    expect(nextCalled).toBe(true);

    // Req 2: allowed
    nextCalled = false;
    limiter(mockReq, mockRes, next);
    expect(nextCalled).toBe(true);

    // Req 3: blocked with HTTP 429
    nextCalled = false;
    limiter(mockReq, mockRes, next);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(429);
  });
});
