import { ChangeDetectionStrategy, Component, inject, model, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { QrScanner } from 'shared-fp';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-scan-dialog',
  standalone: true,
  imports: [FormsModule, QrScanner, Dialog, Button, ProgressSpinner, Select, Toast],
  providers: [MessageService],
  templateUrl: './scan-dialog.html',
  styleUrl: './scan-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanDialog implements OnInit {
  readonly qrCodeScanned = output<ArrayBuffer>();
  private readonly messageService = inject(MessageService);
  readonly availableCameras = signal<MediaDeviceInfo[]>([]);
  readonly selectedCameraId = model<string | undefined>(undefined);
  readonly isLoading = signal(true);

  protected readonly visible = signal(false);

  open() {
    this.visible.set(true);
  }

  async ngOnInit() {
    await this.getCameras();
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
