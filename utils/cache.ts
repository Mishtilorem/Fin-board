/**
 * Intelligent API Response Cache
 * 
 * Features:
 * - URL-based caching with TTL (Time To Live)
 * - Automatic cache expiration
 * - Memory-efficient with size limits
 * - Optional localStorage persistence
 * - Cache statistics and metrics
 * - Request deduplication (prevents duplicate concurrent requests)
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  url: string;
  hitCount: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: based on refresh interval)
  maxSize?: number; // Maximum number of cached entries (default: 50)
  persist?: boolean; // Whether to persist to localStorage (default: false)
  storageKey?: string; // localStorage key (default: 'api-cache')
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };
  private options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 50,
      persist: options.persist ?? false,
      storageKey: options.storageKey ?? 'api-cache',
    };

    // Load from localStorage if persistence is enabled
    if (this.options.persist && typeof window !== 'undefined') {
      this.loadFromStorage();
    }

    // Start cleanup interval (runs every minute)
    this.startCleanup();

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
        if (this.options.persist) {
          this.saveToStorage();
        }
      });
    }
  }

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    // Normalize URL (remove trailing slashes, etc.)
    return url.trim().toLowerCase();
  }

  /**
   * Check if entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get cache entry if valid
   */
  get(url: string): any | null {
    const key = this.getCacheKey(url);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hitCount++;
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(url: string, data: any, ttl?: number): void {
    const key = this.getCacheKey(url);
    const effectiveTtl = ttl ?? this.options.ttl;
    const now = Date.now();

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + effectiveTtl,
      url,
      hitCount: 0,
    };

    this.cache.set(key, entry);

    // Persist if enabled
    if (this.options.persist && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Remove specific cache entry
   */
  delete(url: string): void {
    const key = this.getCacheKey(url);
    this.cache.delete(key);

    if (this.options.persist && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;

    if (this.options.persist && typeof window !== 'undefined') {
      localStorage.removeItem(this.options.storageKey);
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.clear();
      return;
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(entry.url)) {
        this.cache.delete(key);
      }
    }

    if (this.options.persist && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Evict oldest cache entry (LRU-like)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if URL is cached and valid
   */
  has(url: string): boolean {
    const key = this.getCacheKey(url);
    const entry = this.cache.get(key);
    return entry ? this.isValid(entry) : false;
  }

  /**
   * Track pending request to prevent duplicates
   */
  getPendingRequest(url: string): Promise<any> | null {
    return this.pendingRequests.get(this.getCacheKey(url)) || null;
  }

  /**
   * Set pending request
   */
  setPendingRequest(url: string, promise: Promise<any>): void {
    const key = this.getCacheKey(url);
    this.pendingRequests.set(key, promise);

    promise
      .then(() => {
        this.pendingRequests.delete(key);
      })
      .catch(() => {
        this.pendingRequests.delete(key);
      });
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData: Array<[string, Omit<CacheEntry, 'hitCount'>]> = [];
      
      for (const [key, entry] of this.cache.entries()) {
        // Only save valid entries
        if (this.isValid(entry)) {
          cacheData.push([key, {
            data: entry.data,
            timestamp: entry.timestamp,
            expiresAt: entry.expiresAt,
            url: entry.url,
          }]);
        }
      }

      localStorage.setItem(this.options.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (!stored) return;

      const cacheData: Array<[string, Omit<CacheEntry, 'hitCount'>]> = JSON.parse(stored);
      const now = Date.now();

      for (const [key, entryData] of cacheData) {
        // Only load entries that are still valid
        if (entryData.expiresAt > now) {
          this.cache.set(key, {
            ...entryData,
            hitCount: 0,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      localStorage.removeItem(this.options.storageKey);
    }
  }
}

// Create singleton instance
let cacheInstance: ApiCache | null = null;

/**
 * Get or create cache instance
 */
export function getCache(options?: CacheOptions): ApiCache {
  if (!cacheInstance) {
    cacheInstance = new ApiCache(options);
  }
  return cacheInstance;
}

/**
 * Reset cache instance (useful for testing)
 */
export function resetCache(): void {
  if (cacheInstance) {
    cacheInstance.stopCleanup();
    cacheInstance.clear();
    cacheInstance = null;
  }
}

/**
 * Calculate TTL based on refresh interval
 * Uses a fraction of refresh interval to allow for some staleness
 */
export function calculateTTL(refreshIntervalSeconds: number): number {
  // Use 80% of refresh interval as TTL to allow some buffer
  // Minimum 10 seconds, maximum 1 hour
  const ttlSeconds = Math.max(10, Math.min(3600, refreshIntervalSeconds * 0.8));
  return ttlSeconds * 1000; // Convert to milliseconds
}

export type { CacheOptions, CacheStats, CacheEntry };


