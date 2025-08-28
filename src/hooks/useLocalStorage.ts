import { useEffect, useRef, useState, useCallback } from "react";

function reloadLocalStorage<T>(key: string, initialValue: T){
  try {
    const raw = localStorage.getItem(key);
    if(raw === null) {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  }
}

/**
 * 通用本地存储
 * @param key 
 * @param initialValue 
 * @returns 
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isFirst = useRef<boolean>(true);
  const [value, setValue] = useState<T>(() => reloadLocalStorage(key, initialValue));

  useEffect(() => {
    if(isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [value, key]);

  const reset = useCallback((newValue?: T) => {
    setValue(newValue ?? initialValue);
  }, [initialValue]);

  return {value, setValue, reset} as const;
}
