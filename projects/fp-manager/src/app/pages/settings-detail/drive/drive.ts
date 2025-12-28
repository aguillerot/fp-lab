import { Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { driveModeOptions } from 'shared-fp';
import { DriveSettingsFormData } from '../settings-detail.model';

@Component({
  selector: 'app-drive-settings',
  templateUrl: './drive.html',
  imports: [Card, Select, Field],
})
export class DriveSettingsComponent {
  readonly fieldTree = input.required<FieldTree<DriveSettingsFormData, string>>();
  protected readonly driveModeOptions = driveModeOptions;
}
