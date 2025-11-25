import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  CameraProtocolService,
  CameraSettings,
  IntervalDurationPipe,
  QrScanner,
  ShutterSpeedPipe,
} from 'shared-fp';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QrScanner, ShutterSpeedPipe, IntervalDurationPipe, KeyValuePipe],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private cameraProtocolService = inject(CameraProtocolService);

  isScanning = signal(false);
  decodedSettings = signal<CameraSettings | null>(null);
  errorMessage = signal<string | null>(null);

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

  updateSelectedCamera(event: Event) {
    this.selectedCameraId.set((event.target as HTMLSelectElement).value);
  }

  startDecodeScan() {
    this.errorMessage.set(null);
    this.isScanning.set(true);
  }

  onQrCodeScanned(qrData: ArrayBuffer) {
    this.isScanning.set(false);
    try {
      const settings = this.cameraProtocolService.decode(new Uint8Array(qrData));
      this.decodedSettings.set(settings);
    } catch (e) {
      this.errorMessage.set('Failed to decode QR code: ' + (e as Error).message);
    }
  }

  cancelScan() {
    this.isScanning.set(false);
  }

  handleScanError(errorMsg: string) {
    this.errorMessage.set(errorMsg);
    this.isScanning.set(false);
  }

  closeDialog() {
    this.decodedSettings.set(null);
  }

  isDisplayedSeparately(key: string): boolean {
    const separateKeys = [
      'isoMode',
      'isoSensitivity',
      'isoStep',
      'lowIsoExpansion',
      'highIsoExpansion',
      'autoIsoLowerLimit',
      'autoIsoUpperLimit',
      'autoIsoSlowestShutterMode',
      'autoIsoSlowestShutterLimit',
      'shootingModeName',
      'shootingModeIcon',
      'shootingMode',
      'aeMeteringMode',
      'exposureCompensation',
      'driveMode',
      'intervalTimerTimes',
      'intervalTimerDuration',
      'whiteBalanceMode',
      'whiteBalanceShiftBA',
      'whiteBalanceShiftMG',
    ];
    return separateKeys.includes(key);
  }
}
