import { Preferences } from '@capacitor/preferences';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class CacheService {
  private static isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_DURATION;
  }

  static async set<T>(key: string, data: T): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(cacheItem),
      });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      if (!value) return null;

      const cacheItem: CacheItem<T> = JSON.parse(value);
      
      if (this.isExpired(cacheItem.timestamp)) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
