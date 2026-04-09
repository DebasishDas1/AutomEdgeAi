// lib/api/request-cache.ts
/**
 * Request-level caching and deduplication.
 * Prevents duplicate in-flight requests and caches responses intelligently.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
};

type InFlightRequest<T> = Promise<T>;

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private inFlight: Map<string, InFlightRequest<any>> = new Map();

  /**
   * Execute or retrieve a cached/in-flight request.
   * 
   * If a request with this key is already in flight, wait for it.
   * If cached data exists and is fresh, return it immediately.
   * Otherwise, execute the request and cache the result.
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000, // 5 min default
  ): Promise<T> {
    // Check if data is cached and fresh
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Check if request is already in flight
    const inFlight = this.inFlight.get(key);
    if (inFlight) {
      return inFlight;
    }

    // Execute the request and cache it
    const request = fn().then(
      (data) => {
        this.cache.set(key, { data, timestamp: Date.now(), ttl });
        this.inFlight.delete(key);
        return data;
      },
      (error) => {
        this.inFlight.delete(key);
        throw error;
      },
    );

    this.inFlight.set(key, request);
    return request;
  }

  /**
   * Manually invalidate cache entry.
   */
  invalidate(key: string) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache and in-flight requests.
   */
  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const requestCache = new RequestCache();
