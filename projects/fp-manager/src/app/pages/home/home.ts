import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ScanDialog } from 'fp-shared/components';
import { StoredCameraSettings } from 'fp-shared/models';
import { CameraProtocolService } from 'fp-shared/services';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { QrDisplayDialog } from '../../components/qr-display-dialog/qr-display-dialog';
import { SettingsStorageService } from '../../services/settings-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ScanDialog, Toast, Card, Button, TableModule, DatePipe, QrDisplayDialog],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class Home {
  private readonly router = inject(Router);
  private readonly settingsStorage = inject(SettingsStorageService);
  private readonly cameraProtocol = inject(CameraProtocolService);
  private readonly messageService = inject(MessageService);
  protected readonly scanDialogVisible = signal<boolean>(false);
  protected readonly selectedQrCodeData = signal<number[] | null>(null);
  protected readonly qrDisplayDialogVisible = signal<boolean>(false);

  readonly storedSettings = this.settingsStorage.storedSettings;
  readonly isEmpty = this.settingsStorage.isEmpty;

  readonly decodedSettings = computed(() =>
    this.storedSettings().map(item => {
      const decoded = this.cameraProtocol.decode(new Uint8Array(item.qrCodeData));
      return {
        ...item,
        decoded,
      };
    }),
  );

  protected openScanDialog(): void {
    this.scanDialogVisible.set(true);
  }

  protected handleQrCodeScanned(buffer: ArrayBuffer): void {
    try {
      const qrCodeData = new Uint8Array(buffer);
      const stored = this.settingsStorage.save(qrCodeData);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'QR code scanned successfully!',
        life: 3000,
      });
      this.router.navigate(['/settings', stored.id]);
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to decode QR code: ' + (e as Error).message,
        life: 5000,
      });
    }
  }

  openSettings(item: StoredCameraSettings): void {
    this.router.navigate(['/settings', item.id]);
  }

  duplicateSettings(event: Event, item: StoredCameraSettings): void {
    event.stopPropagation();
    this.settingsStorage.duplicate(item.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Duplicated',
      detail: 'Settings duplicated',
      life: 2000,
    });
  }

  deleteSettings(event: Event, item: StoredCameraSettings): void {
    event.stopPropagation();
    this.settingsStorage.remove(item.id);
    this.messageService.add({
      severity: 'info',
      summary: 'Deleted',
      detail: 'Settings deleted',
      life: 2000,
    });
  }

  showQrCode(event: Event, item: StoredCameraSettings): void {
    event.stopPropagation();
    this.selectedQrCodeData.set(Array.from(item.qrCodeData));
    this.qrDisplayDialogVisible.set(true);
  }
}
