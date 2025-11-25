import { Injectable, signal } from '@angular/core';
import { ScanSet } from '../models/analysis.model';

@Injectable({
  providedIn: 'root',
})
export class QrAnalysisService {
  #scanSets = signal(new Map<string, ScanSet>());
  scanSets = this.#scanSets.asReadonly();

  private readonly STORAGE_KEY = 'qrScanSets';

  constructor() {
    this.loadFromStorage();
  }

  addScan(parameterName: string, valueName: string, qrData: ArrayBuffer): void {
    const current = this.#scanSets();
    const existing = current.get(parameterName) || { bytesDiff: [], scans: [] };
    const scanSet: ScanSet = {
      bytesDiff: existing.bytesDiff,
      scans: [...existing.scans, { byteData: new Uint8Array(qrData), valueName }],
    };
    scanSet.bytesDiff = this.compareByteArrays(scanSet.scans.map((s) => s.byteData));
    const updated = new Map(current);
    updated.set(parameterName, scanSet);
    this.#scanSets.set(updated);
    this.saveToStorage();
  }

  private compareByteArrays(data: Uint8Array[]): number[] {
    if (data.length < 2) {
      return [];
    }

    const diffs: number[] = [];
    const maxLength = Math.max(...data.map((d) => d.length));

    for (let i = 0; i < maxLength; i++) {
      const byteSet = new Set<number>();
      const bytesAtPosition = data.map((d) => (i < d.length ? d[i] : null));
      bytesAtPosition.forEach((byte) => {
        if (byte !== null) {
          byteSet.add(byte);
        }
      });
      if (byteSet.size > 1) {
        diffs.push(i);
      }
    }

    return diffs;
  }

  resetParameter(parameterName: string): void {
    const updated = new Map(this.#scanSets());
    updated.delete(parameterName);
    this.#scanSets.set(updated);
    this.saveToStorage();
  }

  hasHistory(parameterName: string): boolean {
    return this.#scanSets().has(parameterName);
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return; // SSR guard
    const map = this.#scanSets();
    const plain: Record<
      string,
      {
        bytesDiff: number[];
        scans: { valueName: string; byteData: number[] }[];
      }
    > = {};
    map.forEach((value, key) => {
      plain[key] = {
        bytesDiff: value.bytesDiff,
        scans: value.scans.map((s) => ({
          valueName: s.valueName,
          byteData: Array.from(s.byteData),
        })),
      };
    });
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plain));
    } catch {
      // Silently ignore storage errors
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return; // SSR guard
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<
        string,
        {
          bytesDiff: number[];
          scans: { valueName: string; byteData: number[] }[];
        }
      >;
      const restored = new Map<string, ScanSet>();
      Object.entries(parsed).forEach(([key, val]) => {
        restored.set(key, {
          bytesDiff: Array.isArray(val.bytesDiff) ? val.bytesDiff : [],
          scans: Array.isArray(val.scans)
            ? val.scans.map((s) => ({
                valueName: s.valueName,
                byteData: new Uint8Array(s.byteData),
              }))
            : [],
        });
      });
      this.#scanSets.set(restored);
    } catch {
      // Ignore malformed data
    }
  }
}
