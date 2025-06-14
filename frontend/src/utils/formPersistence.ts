// Form persistence utilities
export class FormPersistence {
  static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save form data for ${key}:`, error);
    }
  }

  static load<T>(key: string): T | null {
    try {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.warn(`Failed to load form data for ${key}:`, error);
      return null;
    }
  }

  static clear(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear form data for ${key}:`, error);
    }
  }

  static hasData(key: string): boolean {
    try {
      const data = localStorage.getItem(key);
      return data !== null && data.trim() !== '';
    } catch (error) {
      return false;
    }
  }

  static clearAll(pattern?: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (!pattern || key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear form data:', error);
    }
  }
}

// Hook for form persistence
export function useFormPersistence<T>(key: string, initialData: T) {
  const save = (data: T) => FormPersistence.save(key, data);
  const load = () => FormPersistence.load<T>(key);
  const clear = () => FormPersistence.clear(key);
  const hasData = () => FormPersistence.hasData(key);

  return { save, load, clear, hasData };
}
