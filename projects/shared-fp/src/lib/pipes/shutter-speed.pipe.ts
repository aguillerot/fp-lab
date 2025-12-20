import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shutterSpeed',
})
export class ShutterSpeedPipe implements PipeTransform {
  transform(value: unknown): string {
    if (typeof value !== 'number') {
      return String(value);
    }

    // Handle long exposures (>= 0.3s)
    // Note: 1/3 is 0.333..., 1/4 is 0.25
    if (value >= 0.3) {
      // Check for specific values that might be stored as fractions
      if (Math.abs(value - 2 / 3) < 0.01) return '0.6s';
      if (Math.abs(value - 1 / 3) < 0.01) return '0.3s';

      // For integer values, don't show decimals
      if (Number.isInteger(value)) {
        return `${value}s`;
      }
      return `${parseFloat(value.toFixed(1))}s`;
    }

    // Handle fractions (< 0.3s)
    const denominator = Math.round(1 / value);
    return `1/${denominator}s`;
  }
}
