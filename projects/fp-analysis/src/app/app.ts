import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { BytesToHexPipe, HexAtIndexesPipe, QrScanner } from 'shared-fp';
import { QrAnalysisService } from './services/qr-analysis.service';

@Component({
  selector: 'app-root',
  imports: [QrScanner, HexAtIndexesPipe, BytesToHexPipe],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private analysisService = inject(QrAnalysisService);

  parameterName = signal('');
  valueName = signal('');
  isScanning = signal(false);
  errorMessage = signal<string | null>(null);

  readonly scanSets = this.analysisService.scanSets;

  availableCameras = signal<MediaDeviceInfo[]>([]);
  selectedCameraId = signal<string | undefined>(undefined);

  async ngOnInit() {
    await this.getCameras();
  }

  async getCameras() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        this.errorMessage.set('Device enumeration is not supported on this browser.');
        return;
      }

      // Try to get permission to ensure labels are available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Could not get initial camera permission, labels might be missing', err);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      this.availableCameras.set(videoDevices);
      if (videoDevices.length > 0) {
        this.selectedCameraId.set(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      this.errorMessage.set('Could not list cameras. Please grant camera permissions.');
    }
  }

  updateParameterName(event: Event) {
    this.parameterName.set((event.target as HTMLInputElement).value);
  }

  updateValueName(event: Event) {
    this.valueName.set((event.target as HTMLInputElement).value);
  }

  updateSelectedCamera(event: Event) {
    this.selectedCameraId.set((event.target as HTMLSelectElement).value);
  }

  startScan() {
    this.errorMessage.set(null);
    if (this.parameterName().trim() && this.valueName().trim()) {
      this.isScanning.set(true);
    } else {
      this.errorMessage.set(
        'Please provide both a parameter name and a value name before scanning.',
      );
    }
  }

  onQrCodeScanned(qrData: ArrayBuffer) {
    this.isScanning.set(false);
    this.analysisService.addScan(this.parameterName().trim(), this.valueName().trim(), qrData);
    // Clear value for next scan
    this.valueName.set('');
  }

  cancelScan() {
    this.isScanning.set(false);
  }

  handleScanError(errorMsg: string) {
    this.errorMessage.set(errorMsg);
    this.isScanning.set(false);
  }

  resetParameter(paramToReset: string) {
    if (
      paramToReset &&
      confirm(`Are you sure you want to delete all scan data for "${paramToReset}"?`)
    ) {
      this.analysisService.resetParameter(paramToReset);
    }
  }
}
