import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { QrScanner } from '../qr-scanner/qr-scanner';

@Component({
  selector: 'lib-scan-dialog',
  standalone: true,
  imports: [FormsModule, QrScanner, Dialog, Button, ProgressSpinner, Select, Toast],
  providers: [MessageService],
  templateUrl: './scan-dialog.html',
  styleUrl: './scan-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanDialog {
  public readonly visible = model<boolean>(false);
  public readonly qrCodeScanned = output<ArrayBuffer>();
  private readonly messageService = inject(MessageService);
  protected readonly availableCameras = signal<MediaDeviceInfo[]>([]);
  protected readonly selectedCameraId = model<string | undefined>(undefined);
  protected readonly isLoading = signal(true);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.getCameras();
      }
    });
  }

  private async getCameras() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Device enumeration is not supported.',
          life: 5000,
        });
        this.isLoading.set(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.availableCameras.set(videoDevices);

      if (videoDevices.length > 0) {
        this.selectedCameraId.set(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Could not access camera.',
        life: 5000,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onQrCodeScanned(qrData: ArrayBuffer): void {
    this.visible.set(false);
    this.qrCodeScanned.emit(qrData);
  }

  onScanError(errorMsg: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 5000,
    });
  }

  cancel(): void {
    this.visible.set(false);
  }
}
