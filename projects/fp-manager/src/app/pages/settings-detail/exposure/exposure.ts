import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Field, FieldTree } from '@angular/forms/signals';
import { Card } from 'primeng/card';
import { Chip } from 'primeng/chip';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Slider } from 'primeng/slider';
import { aeMeteringModeOptions, shootingModeOptions } from 'shared-fp';
import { ExposureSettingsFormData } from '../settings-detail.model';

@Component({
  selector: 'app-exposure-settings',
  templateUrl: './exposure.html',
  imports: [Slider, Select, Chip, SelectButton, FormsModule, Field, Card],
})
export class ExposureSettingsComponent {
  readonly fieldTree = input.required<FieldTree<ExposureSettingsFormData, string>>();
  protected readonly shootingModeOptions = shootingModeOptions;
  protected readonly aeMeteringModeOptions = aeMeteringModeOptions;
}
