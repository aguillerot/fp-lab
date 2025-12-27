import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { CameraProtocolService, StoredCameraSettings } from 'shared-fp';
import { ScanDialog } from '../../components/scan-dialog/scan-dialog';
import { SettingsStorageService } from '../../services/settings-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ScanDialog, Toast],
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

  protected openScanDialog(): void {
    this.scanDialog().open();
  }

  protected handleQrCodeScanned(qrData: ArrayBuffer): void {
    try {
      const settings = this.cameraProtocol.decode(new Uint8Array(qrData));
      const stored = this.settingsStorage.save(settings);
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
    // this.snackBar.open('Settings deleted', 'OK', { duration: 2000 });
  }
}
