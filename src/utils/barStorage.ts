/**
 * Utility functions for managing saved bars in localStorage
 */

export interface SavedBar {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  scannedAt: string; // ISO timestamp
  lastAccessed?: string; // ISO timestamp
}

const STORAGE_KEY = 'namjukes-saved-bars';

/**
 * Get all saved bars
 */
export function getSavedBars(): SavedBar[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save a bar to the list
 */
export function saveBar(bar: Omit<SavedBar, 'scannedAt' | 'lastAccessed'>): void {
  try {
    const bars = getSavedBars();
    
    // Check if bar already exists
    const existingIndex = bars.findIndex(b => b.slug === bar.slug);
    
    const savedBar: SavedBar = {
      ...bar,
      scannedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing bar
      bars[existingIndex] = savedBar;
    } else {
      // Add new bar
      bars.push(savedBar);
    }

    // Sort by last accessed (most recent first)
    bars.sort((a, b) => {
      const aTime = new Date(a.lastAccessed || a.scannedAt).getTime();
      const bTime = new Date(b.lastAccessed || b.scannedAt).getTime();
      return bTime - aTime;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(bars));
  } catch (error) {
    console.error('Error saving bar:', error);
  }
}

/**
 * Update last accessed time for a bar
 */
export function updateBarAccess(slug: string): void {
  try {
    const bars = getSavedBars();
    const bar = bars.find(b => b.slug === slug);
    if (bar) {
      bar.lastAccessed = new Date().toISOString();
      // Re-sort
      bars.sort((a, b) => {
        const aTime = new Date(a.lastAccessed || a.scannedAt).getTime();
        const bTime = new Date(b.lastAccessed || b.scannedAt).getTime();
        return bTime - aTime;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bars));
    }
  } catch (error) {
    console.error('Error updating bar access:', error);
  }
}

/**
 * Remove a saved bar
 */
export function removeBar(slug: string): void {
  try {
    const bars = getSavedBars();
    const filtered = bars.filter(b => b.slug !== slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing bar:', error);
  }
}

/**
 * Check if a bar is saved
 */
export function isBarSaved(slug: string): boolean {
  const bars = getSavedBars();
  return bars.some(b => b.slug === slug);
}
