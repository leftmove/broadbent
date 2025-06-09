const STORAGE_KEYS = {
  API_KEYS: 'broadbent_api_keys',
  USER_PREFERENCES: 'broadbent_user_preferences',
  THEME: 'broadbent_theme',
} as const;

export class Storage {
  static get(key: keyof typeof STORAGE_KEYS): any {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  static set(key: keyof typeof STORAGE_KEYS, value: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static remove(key: keyof typeof STORAGE_KEYS): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS[key]);
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}