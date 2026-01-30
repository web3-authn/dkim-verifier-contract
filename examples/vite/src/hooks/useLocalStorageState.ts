import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

function readLocalStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return defaultValue;

    try {
      return JSON.parse(raw) as T;
    } catch {
      if (typeof defaultValue === "string") return raw as T;
      if (typeof defaultValue === "boolean") return (raw === "true") as T;
      if (typeof defaultValue === "number") {
        const n = Number(raw);
        return (Number.isFinite(n) ? n : defaultValue) as T;
      }
      return defaultValue;
    }
  } catch {
    return defaultValue;
  }
}

function writeLocalStorageValue(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (private mode, quota, etc.)
  }
}

export function useLocalStorageState<T>(key: string, defaultValue: T): readonly [T, Dispatch<SetStateAction<T>>] {
  const initialValue = useMemo(() => readLocalStorageValue(key, defaultValue), [key, defaultValue]);
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    setValue(readLocalStorageValue(key, defaultValue));
  }, [key, defaultValue]);

  useEffect(() => {
    writeLocalStorageValue(key, value);
  }, [key, value]);

  const set: Dispatch<SetStateAction<T>> = useCallback((next) => {
    setValue((prev) => (typeof next === "function" ? (next as (prev: T) => T)(prev) : next));
  }, []);

  return [value, set] as const;
}

