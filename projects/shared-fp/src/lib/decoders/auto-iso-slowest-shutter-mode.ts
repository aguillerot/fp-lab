import { AutoIsoSlowestShutterMode } from '../models/iso.model';

const INDEX_128 = 128;

export function decodeAutoIsoSlowestShutterMode(data: Uint8Array): AutoIsoSlowestShutterMode {
  if (data.length <= INDEX_128) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Mode');
    return 'auto'; // Default fallback
  }

  // Golden Rule: value = data[index] - index
  // data[128] for Manual is 0x80 (128). 128 - 128 = 0.
  const value = data[INDEX_128] - INDEX_128;

  switch (value) {
    case 0:
      return 'manual';
    case 1:
      return 'auto Faster';
    case 2:
      return 'auto Fast';
    case 3:
      return 'auto';
    case 4:
      return 'auto Slow';
    case 5:
      return 'auto Slower';
    default:
      console.warn(`Unknown Auto ISO Slowest Shutter Mode value: ${value}`);
      return 'auto';
  }
}

export function encodeAutoIsoSlowestShutterMode(mode: AutoIsoSlowestShutterMode, data: Uint8Array): void {
  if (data.length <= INDEX_128) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Mode');
    return;
  }

  let value = 3; // Default 'Auto'
  switch (mode) {
    case 'manual':
      value = 0;
      break;
    case 'auto Faster':
      value = 1;
      break;
    case 'auto Fast':
      value = 2;
      break;
    case 'auto':
      value = 3;
      break;
    case 'auto Slow':
      value = 4;
      break;
    case 'auto Slower':
      value = 5;
      break;
  }

  // Golden Rule: data[index] = index + value
  data[INDEX_128] = (INDEX_128 + value) & 0xff;
}
