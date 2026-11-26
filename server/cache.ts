import crypto from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory SHA-256 LRU cache for idempotent backend responses.
 * Minimizes external API quota usage and yields sub-10ms latency on cache hits.
 */
export class Sha256LruCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  constructor(maxEntries = 100, defaultTtlMs = 15 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a deterministic SHA-256 hash key from structured input.
   */
  static generateKey(prefix: string, payload: unknown): string {
    const serialized = `${prefix}:${typeof payload === 'string' ? payload : JSON.stringify(payload)}`;
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Generates a 64-character SHA-256 hash key from structured input.
   * Full 256-bit entropy eliminates birthday-paradox hash collision risks.
   */
  hashKey(input: unknown): string {
    const serialized = typeof input === 'string' ? input : JSON.stringify(input);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (value === undefined || value === null) {
      return; // Never cache invalid or failed responses
    }

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
