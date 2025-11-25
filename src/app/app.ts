import { JsonPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { BytesToHexPipe } from './components/bytes-to-hex.pipe';
import { HexAtIndexesPipe } from './components/hex-at-indexes.pipe';
import { IntervalDurationPipe } from './components/interval-duration.pipe';
import { QrScanner } from './components/qr-scanner/qr-scanner';
import { ShutterSpeedPipe } from './components/shutter-speed.pipe';
import { CameraSettings } from './models/camera-settings.model';
import { CameraProtocolService } from './services/camera-protocol.service';
import { QrAnalysisService } from './services/qr-analysis.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    QrScanner,
    HexAtIndexesPipe,
    BytesToHexPipe,
    ShutterSpeedPipe,
    IntervalDurationPipe,
    JsonPipe,
    KeyValuePipe,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private analysisService = inject(QrAnalysisService);
  private cameraProtocolService = inject(CameraProtocolService);

  parameterName = signal('');
  valueName = signal('');
  isScanning = signal(false);
  scanMode = signal<'analysis' | 'decode'>('analysis');
  decodedSettings = signal<CameraSettings | null>(null);
  errorMessage = signal<string | null>(null);

  readonly scanSets = this.analysisService.scanSets;

  availableCameras = signal<MediaDeviceInfo[]>([]);
  selectedCameraId = signal<string | undefined>(undefined);
  trackScanSet = (index: number, item: [string, any]) => item[0];

  async ngOnInit() {
    await this.getCameras();
  }

  async getCameras() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        this.errorMessage.set('Device enumeration is not supported on this browser.');
        return;
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
      this.scanMode.set('analysis');
      this.isScanning.set(true);
    } else {
      this.errorMessage.set(
        'Please provide both a parameter name and a value name before scanning.',
      );
    }
  }

  startDecodeScan() {
    this.errorMessage.set(null);
    this.scanMode.set('decode');
    this.isScanning.set(true);
  }

  onQrCodeScanned(qrData: ArrayBuffer) {
    this.isScanning.set(false);

    if (this.scanMode() === 'analysis') {
      this.analysisService.addScan(this.parameterName().trim(), this.valueName().trim(), qrData);
      // Clear value for next scan
      this.valueName.set('');
    } else {
      try {
        const settings = this.cameraProtocolService.decode(new Uint8Array(qrData));
        this.decodedSettings.set(settings);
      } catch (e) {
        this.errorMessage.set('Failed to decode QR code: ' + (e as Error).message);
      }
    }
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

  // private updateAnalysisResults(newEntry: AnalysisEntry) {
  //   const currentGroups = this.analysisGroups();
  //   const paramName = this.parameterName().trim();
  //   const groupIndex = currentGroups.findIndex((g) => g.parameterName === paramName);

  //   if (groupIndex > -1) {
  //     // Create a new array for the groups to ensure immutability
  //     const updatedGroups = [...currentGroups];
  //     const oldGroup = updatedGroups[groupIndex];
  //     // Create a new group object with the new entry added to its entries array
  //     const updatedGroup = {
  //       ...oldGroup,
  //       entries: [...oldGroup.entries, newEntry],
  //     };
  //     // Replace the old group with the new one
  //     updatedGroups[groupIndex] = updatedGroup;
  //     this.analysisGroups.set(updatedGroups);
  //   } else {
  //     // Create a new group if one doesn't exist for the parameter
  //     const newGroup: AnalysisGroup = {
  //       parameterName: paramName,
  //       entries: [newEntry],
  //     };
  //     this.analysisGroups.set([...currentGroups, newGroup]);
  //   }
  // }

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
      // this.analysisGroups.set(
      //   this.analysisGroups().filter((g) => g.parameterName !== paramToReset),
      // );
    }
  }

  toHex(value: number | undefined): string {
    if (value === undefined) return 'N/A';
    return '0x' + value.toString(16).toUpperCase().padStart(2, '0');
  }
}
