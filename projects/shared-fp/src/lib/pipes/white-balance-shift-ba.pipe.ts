import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'whiteBalanceShiftBA' })
export class WhiteBalanceShiftBAPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === 0 || value === null) {
      return 'B-A';
    } else if (value > 0) {
      return `A${value}`;
    }
    return `B${-value}`;
  }
}
