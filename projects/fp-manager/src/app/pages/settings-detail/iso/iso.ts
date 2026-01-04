import { Component, computed, effect, input, untracked } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  allIsoSensitivityOptions,
  autoAndAllIsoSensitivityOptions,
  highIsoSensitivityOptions,
  lowIsoSensitivityOptions,
  slowestIsoShutterSpeedOptions,
} from 'fp-shared/constants';
import { IsoSensitivity } from 'fp-shared/models';
import { SelectItem } from 'primeng/api';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { IsoSettingsFormData } from '../settings-detail.model';

@Component({
  selector: 'app-iso-settings',
  templateUrl: './iso.html',
  imports: [Card, Select, SelectButton, Field, Divider],
})
export class IsoSettingsComponent {
  readonly fieldTree = input.required<FieldTree<IsoSettingsFormData, string>>();

  protected readonly isoSensitivityOptions = computed(() => {
    const lowIsoExpansion = this.fieldTree().lowExpansion().value();
    const highIsoExpansion = this.fieldTree().highExpansion().value();
    return autoAndAllIsoSensitivityOptions.map(iso => ({
      label: iso === 'auto' ? 'Auto' : iso.toString(),
      value: iso,
      disabled:
        (!lowIsoExpansion && lowIsoSensitivityOptions.includes(iso)) ||
        (!highIsoExpansion && highIsoSensitivityOptions.includes(iso)),
    })) satisfies SelectItem<IsoSensitivity>[];
  });
  protected readonly autoIsoLowerLimitOptions = allIsoSensitivityOptions;
  protected readonly autoIsoUpperLimitOptions = allIsoSensitivityOptions;
  protected readonly slowestIsoShutterSpeedOptions = slowestIsoShutterSpeedOptions;

  constructor() {
    effect(() => {
      const lowIsoExpansion = this.fieldTree().lowExpansion().value();
      const highIsoExpansion = this.fieldTree().highExpansion().value();
      const isoSensitivity = untracked(this.fieldTree().sensitivity().value);
      if (!lowIsoExpansion && lowIsoSensitivityOptions.includes(isoSensitivity)) {
        // Reset to safe value
        this.fieldTree().sensitivity().value.set(100);
      } else if (!highIsoExpansion && highIsoSensitivityOptions.includes(isoSensitivity)) {
        // Reset to safe value
        this.fieldTree().sensitivity().value.set(25600);
      }
    });
  }
}
