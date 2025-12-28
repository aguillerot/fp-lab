import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Field, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Chip } from 'primeng/chip';
import { Divider } from 'primeng/divider';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Slider } from 'primeng/slider';
import {
  IsoMode,
  IsoSensitivity,
  IsoSensitivityWithoutAuto,
  IsoStep,
} from 'projects/shared-fp/src/lib/models/iso.model';
import { WhiteBalanceMode } from 'projects/shared-fp/src/lib/models/white-balance.model';
import {
  AeMeteringMode,
  aeMeteringModeOptions,
  allIsoSensitivityOptions,
  autoAndAllIsoSensitivityOptions,
  CameraProtocolService,
  DriveMode,
  driveModeOptions,
  highIsoSensitivityOptions,
  isNotNil,
  lowIsoSensitivityOptions,
  ShootingMode,
  shootingModeOptions,
  StoredCameraSettings,
  whiteBalanceModeOptions,
  WhiteBalanceShiftBAPipe,
  WhiteBalanceShiftMGPipe,
} from 'shared-fp';
import { QrDisplayDialog } from '../../components/qr-display-dialog/qr-display-dialog';
import { SettingsStorageService } from '../../services/settings-storage.service';

type SettingsFormData = {
  iso: {
    sensitivity: IsoSensitivity | null;
    lowExpansion: boolean | null;
    highExpansion: boolean | null;
    autoLowerLimit: IsoSensitivityWithoutAuto | null;
    autoUpperLimit: IsoSensitivityWithoutAuto | null;
    sensitivityStep: IsoStep | null;
  };
  exposure: {
    name: string | null;
    icon: string | null;
    shootingMode: ShootingMode | null;
    compensation: number | null;
    aeMeteringMode: AeMeteringMode | null;
  };
  drive: {
    mode: DriveMode | null;
    intervalTimerTimes: number | 'Infinity' | null;
    intervalTimerDuration: number | null;
  };
  whiteBalance: {
    mode: WhiteBalanceMode | null;
    shiftBA: number | null;
    shiftMG: number | null;
  };
};

type SelectOption<T> = {
  label: string;
  value: T;
  disabled?: boolean;
};

@Component({
  selector: 'app-settings-detail',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Card,
    Divider,
    Field,
    FormsModule,
    SelectButton,
    Select,
    QrDisplayDialog,
    Chip,
    Slider,
    WhiteBalanceShiftBAPipe,
    WhiteBalanceShiftMGPipe,
    Breadcrumb,
  ],
  templateUrl: './settings-detail.html',
  styleUrl: './settings-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDetail {
  private readonly settingsStorage = inject(SettingsStorageService);
  private readonly cameraProtocol = inject(CameraProtocolService);
  protected IsoMode = IsoMode;
  protected readonly aeMeteringModeOptions = aeMeteringModeOptions;
  protected readonly whiteBalanceModeOptions = whiteBalanceModeOptions;
  protected readonly driveModeOptions = driveModeOptions;

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

  readonly settingsFormModel = signal<SettingsFormData>({
    iso: {
      sensitivity: null,
      lowExpansion: null,
      highExpansion: null,
      autoLowerLimit: null,
      autoUpperLimit: null,
      sensitivityStep: null,
    },
    exposure: {
      name: null,
      icon: null,
      shootingMode: null,
      compensation: null,
      aeMeteringMode: null,
    },
    drive: {
      mode: null,
      intervalTimerTimes: null,
      intervalTimerDuration: null,
    },
    whiteBalance: {
      mode: null,
      shiftBA: null,
      shiftMG: null,
    },
  });
  readonly settingsForm = form(this.settingsFormModel);

  protected readonly isoSensitivityOptions = computed(() => {
    const lowIsoExpansion = this.settingsForm.iso.lowExpansion().value() ?? false;
    const highIsoExpansion = this.settingsForm.iso.highExpansion().value() ?? false;
    return autoAndAllIsoSensitivityOptions.map(iso => ({
      label: iso === 'auto' ? 'Auto' : iso.toString(),
      value: iso,
      disabled:
        (!lowIsoExpansion && lowIsoSensitivityOptions.includes(iso)) ||
        (!highIsoExpansion && highIsoSensitivityOptions.includes(iso)),
    })) satisfies SelectOption<IsoSensitivity>[];
  });
  protected readonly autoIsoLowerLimitOptions = allIsoSensitivityOptions;
  protected readonly autoIsoUpperLimitOptions = allIsoSensitivityOptions;
  protected readonly shootingModeOptions = shootingModeOptions;

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
    effect(() => {
      const lowIsoExpansion = this.settingsForm.iso.lowExpansion().value() ?? false;
      const highIsoExpansion = this.settingsForm.iso.highExpansion().value() ?? false;
      const isoSensitivity = untracked(this.settingsForm.iso.sensitivity().value) ?? 'auto';
      if (!lowIsoExpansion && lowIsoSensitivityOptions.includes(isoSensitivity)) {
        // Reset to safe value
        this.settingsForm.iso.sensitivity().value.set(100);
      } else if (!highIsoExpansion && highIsoSensitivityOptions.includes(isoSensitivity)) {
        // Reset to safe value
        this.settingsForm.iso.sensitivity().value.set(25600);
      }
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
    if (isNotNil(formValue.iso.sensitivity)) {
      settings.isoMode = formValue.iso.sensitivity === 'auto' ? IsoMode.Auto : IsoMode.Manual;
      settings.isoSensitivity = formValue.iso.sensitivity;
    }
    if (isNotNil(formValue.iso.lowExpansion)) {
      settings.lowIsoExpansion = formValue.iso.lowExpansion;
    }
    if (isNotNil(formValue.iso.highExpansion)) {
      settings.highIsoExpansion = formValue.iso.highExpansion;
    }
    if (isNotNil(formValue.iso.autoLowerLimit)) {
      settings.autoIsoLowerLimit = formValue.iso.autoLowerLimit;
    }
    if (isNotNil(formValue.iso.autoUpperLimit)) {
      settings.autoIsoUpperLimit = formValue.iso.autoUpperLimit;
    }
    if (isNotNil(formValue.iso.sensitivityStep)) {
      settings.isoStep = formValue.iso.sensitivityStep;
    }
    if (isNotNil(formValue.exposure.compensation)) {
      settings.exposureCompensation = formValue.exposure.compensation;
    }
    if (isNotNil(formValue.exposure.aeMeteringMode)) {
      settings.aeMeteringMode = formValue.exposure.aeMeteringMode;
    }
    if (isNotNil(formValue.drive.mode)) {
      settings.driveMode = formValue.drive.mode;
    }
    const encodedSettings = this.cameraProtocol.encode(
      new Uint8Array(this.storedSettings()?.qrCodeData ?? []),
      settings,
    );
    this.settingsStorage.update(this.id(), encodedSettings);
  }
}
