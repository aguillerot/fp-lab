import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intervalDuration',
  standalone: true,
})
export class IntervalDurationPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    return `${minutes}min ${seconds}s`;
  }
}
