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
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Chip } from 'primeng/chip';
import { Divider } from 'primeng/divider';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Slider } from 'primeng/slider';
import {
  IsoMode,
  IsoSensitivity,
  IsoSensitivityWithoutAuto,
  IsoStep,
} from 'projects/shared-fp/src/lib/models/iso.model';
import {
  AeMeteringMode,
  aeMeteringModeOptions,
  allIsoSensitivityOptions,
  autoAndAllIsoSensitivityOptions,
  CameraProtocolService,
  highIsoSensitivityOptions,
  IntervalDurationPipe,
  isNotNil,
  lowIsoSensitivityOptions,
  ShutterSpeedPipe,
  StoredCameraSettings,
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
    compensation: number | null;
    aeMeteringMode: AeMeteringMode | null;
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
    ShutterSpeedPipe,
    IntervalDurationPipe,
    Button,
    Card,
    Divider,
    Field,
    FormsModule,
    InputGroup,
    InputGroupAddon,
    SelectButton,
    Select,
    QrDisplayDialog,
    Chip,
    Slider,
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

  readonly id = input.required<string>();

  private readonly qrDisplayDialog = viewChild<QrDisplayDialog>('qrDisplayDialog');

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
      compensation: null,
      aeMeteringMode: null,
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

  constructor() {
    effect(() => {
      const settings = this.decodedSettings();
      if (!settings) {
        return;
      }
      console.log('stored settings changed', settings);
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
          compensation: settings.exposureCompensation,
          aeMeteringMode: settings.aeMeteringMode,
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
    const encodedSettings = this.cameraProtocol.encode(
      new Uint8Array(this.storedSettings()?.qrCodeData ?? []),
      settings,
    );
    this.settingsStorage.update(this.id(), encodedSettings);
  }
}
