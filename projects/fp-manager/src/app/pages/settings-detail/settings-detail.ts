import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { CameraProtocolService, IsoMode, StoredCameraSettings } from 'shared-fp';
import { QrDisplayDialog } from '../../components/qr-display-dialog/qr-display-dialog';
import { SettingsStorageService } from '../../services/settings-storage.service';
import { DriveSettingsComponent } from './drive/drive';
import { ExposureSettingsComponent } from './exposure/exposure';
import { IsoSettingsComponent } from './iso/iso';
import { getDefaultSettingsFormData, SettingsFormData } from './settings-detail.model';
import { WhiteBalanceSettingsComponent } from './white-balance/white-balance';

@Component({
  selector: 'app-settings-detail',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    FormsModule,
    QrDisplayDialog,
    Breadcrumb,
    ExposureSettingsComponent,
    IsoSettingsComponent,
    DriveSettingsComponent,
    WhiteBalanceSettingsComponent,
  ],
  templateUrl: './settings-detail.html',
  styleUrl: './settings-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDetail {
  private readonly settingsStorage = inject(SettingsStorageService);
  private readonly cameraProtocol = inject(CameraProtocolService);
  readonly id = input.required<string>();

  private readonly qrDisplayDialog = viewChild<QrDisplayDialog>('qrDisplayDialog');

  protected readonly items: MenuItem[] = [{ label: 'Settings Detail' }];

  protected readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  readonly storedSettings = computed<StoredCameraSettings | undefined>(() => this.settingsStorage.getById(this.id()));

  readonly decodedSettings = computed(() => {
    const stored = this.storedSettings();
    if (!stored) {
      return undefined;
    }
    return this.cameraProtocol.decode(new Uint8Array(stored.qrCodeData));
  });

  readonly settingsFormModel = signal<SettingsFormData>(getDefaultSettingsFormData());
  readonly settingsForm = form(this.settingsFormModel);

  constructor() {
    effect(() => {
      const settings = this.decodedSettings();
      if (!settings) {
        return;
      }
      this.settingsFormModel.set({
        iso: {
          sensitivity: settings.isoSensitivity,
          lowExpansion: settings.lowIsoExpansion,
          highExpansion: settings.highIsoExpansion,
          autoLowerLimit: settings.autoIsoLowerLimit,
          autoUpperLimit: settings.autoIsoUpperLimit,
          sensitivityStep: settings.isoStep,
        },
        exposure: {
          name: settings.shootingModeName,
          icon: settings.shootingModeIcon,
          shootingMode: settings.shootingMode,
          compensation: settings.exposureCompensation,
          aeMeteringMode: settings.aeMeteringMode,
        },
        drive: {
          mode: settings.driveMode,
          intervalTimerTimes: settings.intervalTimerTimes,
          intervalTimerDuration: settings.intervalTimerDuration,
        },
        whiteBalance: {
          mode: settings.whiteBalanceMode,
          shiftBA: settings.whiteBalanceShiftBA,
          shiftMG: settings.whiteBalanceShiftMG,
        },
      });
    });
  }

  showQrCode(): void {
    this.qrDisplayDialog()?.open();
  }

  onSubmit(): void {
    const formValue = this.settingsForm().value();
    const settings = this.decodedSettings();
    if (!settings) {
      console.warn('No decoded settings available');
      return;
    }
    settings.isoMode = formValue.iso.sensitivity === 'auto' ? IsoMode.Auto : IsoMode.Manual;
    settings.isoSensitivity = formValue.iso.sensitivity;
    settings.lowIsoExpansion = formValue.iso.lowExpansion;
    settings.highIsoExpansion = formValue.iso.highExpansion;
    settings.autoIsoLowerLimit = formValue.iso.autoLowerLimit;
    settings.autoIsoUpperLimit = formValue.iso.autoUpperLimit;
    settings.isoStep = formValue.iso.sensitivityStep;
    settings.exposureCompensation = formValue.exposure.compensation;
    settings.aeMeteringMode = formValue.exposure.aeMeteringMode;
    settings.driveMode = formValue.drive.mode;
    settings.shootingMode = formValue.exposure.shootingMode;
    settings.shootingModeName = formValue.exposure.name;
    settings.shootingModeIcon = formValue.exposure.icon;
    settings.intervalTimerTimes = formValue.drive.intervalTimerTimes;
    settings.intervalTimerDuration = formValue.drive.intervalTimerDuration;
    settings.whiteBalanceMode = formValue.whiteBalance.mode;
    settings.whiteBalanceShiftBA = formValue.whiteBalance.shiftBA;
    settings.whiteBalanceShiftMG = formValue.whiteBalance.shiftMG;

    const encodedSettings = this.cameraProtocol.encode(
      new Uint8Array(this.storedSettings()?.qrCodeData ?? []),
      settings,
    );
    this.settingsStorage.update(this.id(), encodedSettings);
  }
}
