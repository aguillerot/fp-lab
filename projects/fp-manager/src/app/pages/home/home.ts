import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { CameraProtocolService, StoredCameraSettings } from 'shared-fp';
import { ScanDialog } from '../../components/scan-dialog/scan-dialog';
import { SettingsStorageService } from '../../services/settings-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ScanDialog, Toast, Card, Button, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class Home {
  private readonly router = inject(Router);
  private readonly settingsStorage = inject(SettingsStorageService);
  private readonly cameraProtocol = inject(CameraProtocolService);
  private readonly messageService = inject(MessageService);
  private readonly scanDialog = viewChild.required<ScanDialog>('scanDialog');

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
    this.scanDialog().open();
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
}
