// Single Responsibility: Hook para persistir estado no localStorage
import React from 'react';

export const usePersisted = <T,>(key: string, initial: T) => {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);
  
  return [value, setValue] as const;
};