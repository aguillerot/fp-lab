import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from 'shared-fp';
import { ScanSet } from '../models/analysis.model';

type StoredScanSet = {
  bytesDiff: number[];
  scans: { valueName: string; byteData: number[] }[];
};

@Injectable({
  providedIn: 'root',
})
export class QrAnalysisService {
  private readonly storage = inject(StorageService);
  private readonly STORAGE_KEY = 'qrScanSets';

  readonly #scanSets = signal(this.getScanSetsFromStorage());
  readonly scanSets = this.#scanSets.asReadonly();

  addScan(parameterName: string, valueName: string, qrData: ArrayBuffer): void {
    const current = this.#scanSets();
    const existing = current.get(parameterName) || { bytesDiff: [], scans: [] };
    const scanSet: ScanSet = {
      bytesDiff: existing.bytesDiff,
      scans: [...existing.scans, { byteData: new Uint8Array(qrData), valueName }],
    };
    scanSet.bytesDiff = this.compareByteArrays(scanSet.scans.map(s => s.byteData));
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
    const maxLength = Math.max(...data.map(d => d.length));

    for (let i = 0; i < maxLength; i++) {
      const byteSet = new Set<number>();
      const bytesAtPosition = data.map(d => (i < d.length ? d[i] : null));
      bytesAtPosition.forEach(byte => {
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
    const map = this.#scanSets();
    const plain: Record<string, StoredScanSet> = {};
    map.forEach((value, key) => {
      plain[key] = {
        bytesDiff: value.bytesDiff,
        scans: value.scans.map(s => ({
          valueName: s.valueName,
          byteData: Array.from(s.byteData),
        })),
      };
    });
    this.storage.set(this.STORAGE_KEY, plain);
  }

  private getScanSetsFromStorage(): Map<string, ScanSet> {
    const parsed = this.storage.get<Record<string, StoredScanSet>>(this.STORAGE_KEY);
    if (!parsed) return new Map();

    const restored = new Map<string, ScanSet>();
    Object.entries(parsed).forEach(([key, val]) => {
      restored.set(key, {
        bytesDiff: Array.isArray(val.bytesDiff) ? val.bytesDiff : [],
        scans: Array.isArray(val.scans)
          ? val.scans.map(s => ({
              valueName: s.valueName,
              byteData: new Uint8Array(s.byteData),
            }))
          : [],
      });
    });
    return restored;
  }
}
