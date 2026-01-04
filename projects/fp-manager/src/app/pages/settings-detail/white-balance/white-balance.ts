import { Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { whiteBalanceModeOptions } from 'fp-shared/constants';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { WhiteBalanceSettingsFormData } from '../settings-detail.model';
import { WhiteBalanceGridComponent } from './white-balance-grid/white-balance-grid.component';

@Component({
  selector: 'app-white-balance-settings',
  templateUrl: './white-balance.html',
  imports: [Field, Card, Select, WhiteBalanceGridComponent],
})
export class WhiteBalanceSettingsComponent {
  readonly fieldTree = input.required<FieldTree<WhiteBalanceSettingsFormData, string>>();
  protected readonly whiteBalanceModeOptions = whiteBalanceModeOptions;
}
