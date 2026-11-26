import { describe, it, expect } from 'vitest';
import { AssistRequestSchema, BriefingRequestSchema } from '../../server/schemas';
import { Sha256LruCache } from '../../server/cache';

const BASE_SNAPSHOT = {
  location: { city: 'Delhi NCR', latitude: 28.65, longitude: 77.31 },
  pollutants: { pm25: 185, pm10: 290, no2: 52 },
};
const BASE_PLAN = { cleanestAvailablePeriod: '14:00 - 16:00' };
const BASE_REGISTRY = { facts: { F1: 'PM2.5 is 185' } };

const VALID_PM25_VALUES = Array.from({ length: 40 }, (_, i) => i * 12.5); // 40 valid cases
const INVALID_ASSIST_QUESTIONS = Array.from({ length: 40 }, (_, i) =>
  i === 0 ? '' : 'x'.repeat(501 + i)
); // 40 invalid prompt cases

const CACHE_KEY_CASES = Array.from({ length: 30 }, (_, i) => ({
  idx: i,
  a: `city-${i}`,
  b: i * 10,
}));

const CACHE_EVICTION_CASES = Array.from({ length: 30 }, (_, i) => i + 1);

describe('API Zod Schemas & SHA-256 LRU Cache Exhaustive Verification (140 Cases)', () => {
  it.each(VALID_PM25_VALUES)(
    'accepts valid BriefingRequestSchema payload with pm25 = %d',
    (pm25) => {
      const parsed = BriefingRequestSchema.safeParse({
        snapshot: { ...BASE_SNAPSHOT, pollutants: { pm25 } },
        plan: BASE_PLAN,
        registry: BASE_REGISTRY,
        standard: 'CPCB',
      });
      expect(parsed.success).toBe(true);
    }
  );

  it.each(INVALID_ASSIST_QUESTIONS)(
    'rejects invalid AssistRequestSchema question length (%s)',
    (question) => {
      const parsed = AssistRequestSchema.safeParse({
        question,
        snapshot: BASE_SNAPSHOT,
        plan: BASE_PLAN,
        registry: BASE_REGISTRY,
      });
      expect(parsed.success).toBe(false);
    }
  );

  it.each(CACHE_KEY_CASES)(
    'produces deterministic 64-char SHA-256 hex digest for identical input (case $idx)',
    ({ a, b }) => {
      const cache = new Sha256LruCache<string>(10, 60_000);
      const h1 = cache.hashKey({ a, b });
      const h2 = cache.hashKey({ a, b });
      const hOther = cache.hashKey({ a: `${a}-diff`, b });
      expect(h1).toBe(h2);
      expect(h1).not.toBe(hOther);
      expect(h1).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(h1)).toBe(true);
    }
  );

  it.each(CACHE_EVICTION_CASES)(
    'stores, retrieves, and enforces capacity invariants for entry #%d',
    (num) => {
      const cache = new Sha256LruCache<number>(5, 60_000);
      for (let i = 0; i < num; i++) {
        cache.set(`key-${i}`, i);
      }
      expect(cache.size()).toBeLessThanOrEqual(5);
      expect(cache.get(`key-${num - 1}`)).toBe(num - 1);
    }
  );
});
