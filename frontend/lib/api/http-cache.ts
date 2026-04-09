// lib/api/http-cache.ts
/**
 * HTTP caching utilities for handling Cache-Control, ETag, and conditional requests.
 * Respects server cache headers and enables client-side validation.
 */

type CachedResponse<T> = {
  data: T;
  headers: Headers;
  timestamp: number;
};

class HttpCacheStore {
  private store: Map<string, CachedResponse<any>> = new Map();

  /**
   * Store response with headers for future validation.
   */
  set(key: string, data: any, headers: Headers) {
    this.store.set(key, {
      data,
      headers: new Headers(headers),
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached response if available and not expired.
   */
  get(key: string): CachedResponse<any> | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check if cache is still valid based on Cache-Control
    if (this.isCacheValid(entry)) {
      return entry;
    }

    // Cache is stale but keep it for conditional requests
    return null;
  }

  /**
   * Check if a cache entry is still valid.
   */
  private isCacheValid(entry: CachedResponse<any>): boolean {
    const cacheControl = entry.headers.get("cache-control");
    if (!cacheControl) return true; // No cache directive, assume valid

    const maxAge = this.extractMaxAge(cacheControl);
    const age = (Date.now() - entry.timestamp) / 1000;

    return !(maxAge && age > maxAge);
  }

  /**
   * Build conditional request headers (If-None-Match, If-Modified-Since).
   * Works with stale cache entries for revalidation.
   */
  getConditionalHeaders(key: string): Record<string, string> {
    const entry = this._getStaleEntry(key);
    if (!entry) return {};

    const headers: Record<string, string> = {};

    const etag = entry.headers.get("etag");
    if (etag) {
      headers["If-None-Match"] = etag;
    }

    const lastModified = entry.headers.get("last-modified");
    if (lastModified) {
      headers["If-Modified-Since"] = lastModified;
    }

    return headers;
  }

  /**
   * Clear all cached responses.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Internal method: Get stale cache entry for revalidation.
   * This is used by fetchWithCache for ETag/Last-Modified headers.
   */
  _getStaleEntry(key: string): CachedResponse<any> | null {
    return this.store.get(key) || null;
  }

  /**
   * Parse Cache-Control max-age value.
   */
  private extractMaxAge(cacheControl: string): number | null {
    const match = cacheControl.match(/max-age=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }
}

export const httpCache = new HttpCacheStore();

/**
 * Make a fetch request with automatic HTTP caching support.
 * 
 * Strategy:
 * 1. Return fresh cache if available
 * 2. Use ETag/Last-Modified for revalidation if stale
 * 3. Return stale cache on 304 Not Modified
 * 4. Cache new responses with max-age
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
): Promise<T> {
  const key = cacheKey || url;

  // Check for cached response
  const cached = httpCache.get(key);
  if (cached) {
    return cached.data;
  }

  // Build headers, including conditional headers for stale cache revalidation
  const baseHeaders = options.headers instanceof Headers 
    ? Object.fromEntries(options.headers.entries())
    : (typeof options.headers === 'object' && options.headers) || {};
  
  const conditionalHeaders = httpCache.getConditionalHeaders(key);
  const mergedHeaders = {
    ...baseHeaders,
    ...conditionalHeaders,
  };

  const response = await fetch(url, { ...options, headers: mergedHeaders });

  // Handle 304 Not Modified - return stale cached data
  if (response.status === 304) {
    const staleEntry = httpCache._getStaleEntry(key);
    if (staleEntry) {
      return staleEntry.data;
    }
    // No cache available but got 304 - treat as success with no data
    return undefined as unknown as T;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Store in cache with headers
  httpCache.set(key, data, response.headers);

  return data;
}
