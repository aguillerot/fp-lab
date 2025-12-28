import { Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Slider } from 'primeng/slider';
import { whiteBalanceModeOptions, WhiteBalanceShiftBAPipe, WhiteBalanceShiftMGPipe } from 'shared-fp';
import { WhiteBalanceSettingsFormData } from '../settings-detail.model';

@Component({
  selector: 'app-white-balance-settings',
  templateUrl: './white-balance.html',
  imports: [Field, Card, Select, Slider, WhiteBalanceShiftBAPipe, WhiteBalanceShiftMGPipe],
})
export class WhiteBalanceSettingsComponent {
  readonly fieldTree = input.required<FieldTree<WhiteBalanceSettingsFormData, string>>();
  protected readonly whiteBalanceModeOptions = whiteBalanceModeOptions;
}
