import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'whiteBalanceShiftMG' })
export class WhiteBalanceShiftMGPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === 0 || value === null) {
      return 'M-G';
    } else if (value > 0) {
      return `G${value}`;
    }
    return `M${-value}`;
  }
}
