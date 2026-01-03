/**
 * Offline storage utility using IndexedDB for caching bar data (albums and songs)
 */

interface CachedBarData {
  barId: string;
  slug: string;
  bar: any;
  albums: any[];
  cachedAt: string;
}

const DB_NAME = 'namjukes-offline';
const DB_VERSION = 1;
const STORE_NAME = 'barData';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'barId' });
      }
    };
  });
}

/**
 * Cache bar data (albums and songs) for offline access
 */
export async function cacheBarData(
  barId: string,
  slug: string,
  bar: any,
  albums: any[]
): Promise<void> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data: CachedBarData = {
      barId,
      slug,
      bar,
      albums,
      cachedAt: new Date().toISOString(),
    };

    await store.put(data);
  } catch (error) {
    console.error('Error caching bar data:', error);
  }
}

/**
 * Get cached bar data by slug
 */
export async function getCachedBarData(slug: string): Promise<CachedBarData | null> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.slug === slug) {
            resolve(cursor.value);
            return;
          }
          cursor.continue();
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached bar data:', error);
    return null;
  }
}

/**
 * Get cached bar data by bar ID
 */
export async function getCachedBarDataById(barId: string): Promise<CachedBarData | null> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(barId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached bar data by ID:', error);
    return null;
  }
}

/**
 * Remove cached bar data
 */
export async function removeCachedBarData(barId: string): Promise<void> {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.delete(barId);
  } catch (error) {
    console.error('Error removing cached bar data:', error);
  }
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
