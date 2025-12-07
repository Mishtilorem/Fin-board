import axios, { AxiosError } from 'axios';
import { getCache, calculateTTL } from './cache';

export interface ApiResponse {
  data: any;
  error?: string;
  fromCache?: boolean;
}

interface FetchOptions {
  refreshInterval?: number; // in seconds - used to calculate cache TTL
  bypassCache?: boolean; // Force fresh fetch
  cacheTTL?: number; // Override TTL in milliseconds
}

/**
 * Fetch API data with intelligent caching
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options including cache configuration
 * @returns Promise with API response (may be from cache)
 */
export const fetchApiData = async (
  url: string, 
  options: FetchOptions = {}
): Promise<ApiResponse> => {
  const { refreshInterval, bypassCache = false, cacheTTL } = options;
  const cache = getCache();

  // Check cache first (unless bypassed)
  if (!bypassCache) {
    const cachedData = cache.get(url);
    if (cachedData !== null) {
      return {
        data: cachedData,
        fromCache: true,
      };
    }

    // Check for pending request to avoid duplicate concurrent calls
    const pendingRequest = cache.getPendingRequest(url);
    if (pendingRequest) {
      try {
        const data = await pendingRequest;
        return {
          data,
          fromCache: false,
        };
      } catch (error) {
        // If pending request failed, continue with new request
      }
    }
  }

  // Create fetch promise
  const fetchPromise = (async (): Promise<any> => {
    try {
      // Try direct fetch first
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = response.data;

      // Cache the successful response
      if (!bypassCache && data !== null && data !== undefined) {
        const ttl = cacheTTL || (refreshInterval ? calculateTTL(refreshInterval) : undefined);
        cache.set(url, data, ttl);
      }

      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // If CORS error, try using proxy
      if (axiosError.code === 'ERR_NETWORK' || (axiosError.response?.status === 0)) {
        try {
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
          const proxyResponse = await axios.get(proxyUrl, {
            timeout: 10000,
          });
          
          const data = proxyResponse.data;

          // Cache the successful proxy response
          if (!bypassCache && data !== null && data !== undefined) {
            const ttl = cacheTTL || (refreshInterval ? calculateTTL(refreshInterval) : undefined);
            cache.set(url, data, ttl);
          }

          return data;
        } catch (proxyError) {
          throw new Error('Network error: Unable to reach the API. Please check your connection.');
        }
      }
      
      if (axiosError.response) {
        throw new Error(`API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
      } else if (axiosError.request) {
        throw new Error('Network error: Unable to reach the API. Please check your connection.');
      } else {
        throw new Error(`Error: ${axiosError.message}`);
      }
    }
  })();

  // Track pending request to prevent duplicates
  cache.setPendingRequest(url, fetchPromise);

  try {
    const data = await fetchPromise;
    return {
      data,
      fromCache: false,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to fetch data',
      fromCache: false,
    };
  }
};

// Helper to extract nested values from object using dot notation path
export const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return null;
  
  return path.split('.').reduce((current, prop) => {
    if (current === null || current === undefined) return null;
    
    // Handle array indices like "items[0].name"
    const arrayMatch = prop.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      return current[arrayName] && Array.isArray(current[arrayName]) ? current[arrayName][index] : null;
    }
    
    return current[prop] !== undefined ? current[prop] : null;
  }, obj);
};

// Flatten nested object to paths
export const flattenObject = (obj: any, prefix = ''): Array<{ path: string; value: any; type: string }> => {
  const result: Array<{ path: string; value: any; type: string }> = [];

  // Handle case where root is an array
  if (Array.isArray(obj) && prefix === '') {
    result.push({ path: 'root', value: obj, type: 'array' });
    // If array contains objects, show first item structure
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      result.push(...flattenObject(obj[0], '[0]'));
    }
    return result;
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        result.push({ path: fullPath, value: null, type: 'null' });
      } else if (Array.isArray(value)) {
        result.push({ path: fullPath, value: value, type: 'array' });
        // If array contains objects, show first item structure
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          result.push(...flattenObject(value[0], `${fullPath}[0]`));
        }
      } else if (typeof value === 'object') {
        result.push({ path: fullPath, value: value, type: 'object' });
        result.push(...flattenObject(value, fullPath));
      } else {
        result.push({
          path: fullPath,
          value: value,
          type: typeof value,
        });
      }
    }
  }

  return result;
};

// Cache management utilities
export const clearApiCache = (): void => {
  const cache = getCache();
  cache.clear();
};

export const invalidateApiCache = (pattern?: string | RegExp): void => {
  const cache = getCache();
  cache.invalidate(pattern);
};

export const getCacheStats = () => {
  const cache = getCache();
  return cache.getStats();
};

export const deleteApiCache = (url: string): void => {
  const cache = getCache();
  cache.delete(url);
};
