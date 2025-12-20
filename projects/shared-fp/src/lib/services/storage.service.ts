import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly isAvailable = typeof window !== 'undefined' && !!window.localStorage;

  get<T>(key: string): T | null {
    if (!this.isAvailable) return null;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
}
