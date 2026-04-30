export function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (rawValue === null) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function removeStorageValue(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}
