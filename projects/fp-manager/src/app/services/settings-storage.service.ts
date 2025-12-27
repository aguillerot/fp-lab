import { computed, inject, Injectable, signal } from '@angular/core';
import { CameraSettings, StorageService, StoredCameraSettings } from 'shared-fp';

const STORAGE_KEY = 'fp-manager-scanned-settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsStorageService {
  private readonly storageService = inject(StorageService);

  private readonly storedSettingsSignal = signal<StoredCameraSettings[]>(this.loadFromStorage());

  readonly storedSettings = this.storedSettingsSignal.asReadonly();
  readonly isEmpty = computed(() => this.storedSettingsSignal().length === 0);

  save(settings: CameraSettings): StoredCameraSettings {
    const stored: StoredCameraSettings = {
      id: crypto.randomUUID(),
      scannedAt: Date.now(),
      settings,
    };

    const current = this.storedSettingsSignal();
    const updated = [stored, ...current];
    this.storedSettingsSignal.set(updated);
    this.saveToStorage(updated);

    return stored;
  }

  getById(id: string): StoredCameraSettings | undefined {
    return this.storedSettingsSignal().find(s => s.id === id);
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
