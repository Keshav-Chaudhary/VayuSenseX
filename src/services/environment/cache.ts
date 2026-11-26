/**
 * In-Memory & LocalStorage Cache with Request Coalescing
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightPromises = new Map<string, Promise<unknown>>();

export const EnvironmentalCache = {
  /**
   * Fetch with automatic caching, request deduplication, and stale handling.
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs: number = 15 * 60 * 1000 // 15 mins default
  ): Promise<{ data: T; isCached: boolean; isStale: boolean }> {
    const now = Date.now();

    const memEntry = memoryCache.get(key);
    if (memEntry) {
      const isStale = now - memEntry.cachedAt > memEntry.ttlMs;
      if (!isStale) {
        return { data: memEntry.data as T, isCached: true, isStale: false };
      }
    }

    try {
      const localData = localStorage.getItem(`vayusensex_cache_${key}`);
      if (localData) {
        const parsed: CacheEntry<T> = JSON.parse(localData);
        const isStale = now - parsed.cachedAt > parsed.ttlMs;
        if (!isStale) {
          memoryCache.set(key, parsed);
          return { data: parsed.data, isCached: true, isStale: false };
        }
      }
    } catch {
      // Ignore localStorage failure in restricted contexts
    }

    let ongoingPromise = inFlightPromises.get(key) as Promise<T> | undefined;
    if (ongoingPromise) {
      const result = await ongoingPromise;
      return { data: result, isCached: true, isStale: false };
    }

    ongoingPromise = (async () => {
      try {
        const freshData = await fetchFn();
        const entry: CacheEntry<T> = { data: freshData, cachedAt: Date.now(), ttlMs };
        memoryCache.set(key, entry);

        try {
          localStorage.setItem(`vayusensex_cache_${key}`, JSON.stringify(entry));
        } catch {
          // LocalStorage quota or access denied
        }

        return freshData;
      } finally {
        inFlightPromises.delete(key);
      }
    })();

    inFlightPromises.set(key, ongoingPromise);

    try {
      const freshResult = await ongoingPromise;
      return { data: freshResult, isCached: false, isStale: false };
    } catch (err) {
      if (memEntry) {
        return { data: memEntry.data as T, isCached: true, isStale: true };
      }
      throw err;
    }
  },

  clear(): void {
    memoryCache.clear();
    inFlightPromises.clear();
    try {
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('vayusensex_cache_'))
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch {
      // Ignore storage errors
    }
  },
};
