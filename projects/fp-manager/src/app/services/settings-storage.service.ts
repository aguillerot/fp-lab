import { computed, inject, Injectable, signal } from '@angular/core';
import { StoredCameraSettings } from 'fp-shared/models';
import { StorageService } from 'fp-shared/services';

const STORAGE_KEY = 'fp-manager-scanned-settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsStorageService {
  private readonly storageService = inject(StorageService);

  private readonly storedSettingsSignal = signal<StoredCameraSettings[]>(this.loadFromStorage());

  readonly storedSettings = this.storedSettingsSignal.asReadonly();
  readonly isEmpty = computed(() => this.storedSettingsSignal().length === 0);

  save(qrCodeData: Uint8Array): StoredCameraSettings {
    const now = Date.now();
    const stored: StoredCameraSettings = {
      id: crypto.randomUUID(),
      scannedAt: now,
      modifiedAt: now,
      qrCodeData: Array.from(qrCodeData),
    };

    const current = this.storedSettingsSignal();
    const updated = [stored, ...current];
    this.storedSettingsSignal.set(updated);
    this.saveToStorage(updated);

    return stored;
  }

  update(id: string, qrCodeData: Uint8Array): void {
    const current = this.storedSettingsSignal();
    const updated = current.map(s =>
      s.id === id
        ? {
            ...s,
            modifiedAt: Date.now(),
            qrCodeData: Array.from(qrCodeData),
          }
        : s,
    );
    this.storedSettingsSignal.set(updated);
    this.saveToStorage(updated);
  }

  getById(id: string): StoredCameraSettings | undefined {
    return this.storedSettingsSignal().find(s => s.id === id);
  }

  duplicate(id: string): StoredCameraSettings | undefined {
    const original = this.getById(id);
    if (!original) return undefined;

    const now = Date.now();
    const duplicated: StoredCameraSettings = {
      ...original,
      id: crypto.randomUUID(),
      modifiedAt: now,
    };

    const current = this.storedSettingsSignal();
    const updated = [duplicated, ...current];
    this.storedSettingsSignal.set(updated);
    this.saveToStorage(updated);

    return duplicated;
  }

  remove(id: string): void {
    const updated = this.storedSettingsSignal().filter(s => s.id !== id);
    this.storedSettingsSignal.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): StoredCameraSettings[] {
    return this.storageService.get<StoredCameraSettings[]>(STORAGE_KEY) ?? [];
  }

  private saveToStorage(settings: StoredCameraSettings[]): void {
    this.storageService.set(STORAGE_KEY, settings);
  }
}
