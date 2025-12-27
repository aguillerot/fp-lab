import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Field, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { IsoMode } from 'projects/shared-fp/src/lib/models/iso.model';
import { IntervalDurationPipe, ShutterSpeedPipe, StoredCameraSettings } from 'shared-fp';
import { SettingsStorageService } from '../../services/settings-storage.service';

type SettingsFormData = {
  isoMode: IsoMode | null;
  lowIsoExpansion: boolean | null;
  highIsoExpansion: boolean | null;
  autoIsoLowerLimit: number | null;
  autoIsoUpperLimit: number | null;
};

const isoOptions: number[] = [
  6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600,
  2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200, 64000, 80000,
  102400,
];

@Component({
  selector: 'app-settings-detail',
  standalone: true,
  imports: [
    RouterLink,
    ShutterSpeedPipe,
    IntervalDurationPipe,
    Card,
    Divider,
    Field,
    FormsModule,
    InputGroup,
    InputGroupAddon,
    SelectButton,
    Select,
  ],
  templateUrl: './settings-detail.html',
  styleUrl: './settings-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDetail {
  private readonly settingsStorage = inject(SettingsStorageService);
  protected IsoMode = IsoMode;
  protected readonly autoIsoLowerLimitOptions = [...isoOptions];
  protected readonly autoIsoUpperLimitOptions = [...isoOptions];

  readonly id = input.required<string>();

  readonly storedSettings = computed<StoredCameraSettings | undefined>(() => this.settingsStorage.getById(this.id()));

  readonly settings = computed(() => this.storedSettings()?.settings);

  readonly settingsFormModel = signal<SettingsFormData>({
    isoMode: null,
    lowIsoExpansion: null,
    highIsoExpansion: null,
    autoIsoLowerLimit: null,
    autoIsoUpperLimit: null,
  });
  readonly settingsForm = form(this.settingsFormModel);

  readonly checked = signal<boolean>(false);

  constructor() {
    effect(() => {
      const settings = this.settings();
      if (!settings) {
        return;
      }
      console.log(settings);
      this.settingsFormModel.set({
        isoMode: settings.isoMode,
        lowIsoExpansion: settings.lowIsoExpansion,
        highIsoExpansion: settings.highIsoExpansion,
        autoIsoLowerLimit: settings.autoIsoLowerLimit,
        autoIsoUpperLimit: settings.autoIsoUpperLimit,
      });
    });
  }
}
