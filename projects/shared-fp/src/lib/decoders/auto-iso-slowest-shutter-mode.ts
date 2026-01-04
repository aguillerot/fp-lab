import { AutoIsoSlowestShutterMode } from '../models/iso.model';

const INDEX_128 = 128;

export function decodeAutoIsoSlowestShutterMode(data: Uint8Array): AutoIsoSlowestShutterMode {
  if (data.length <= INDEX_128) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Mode');
    return 'Auto'; // Default fallback
  }

  // Golden Rule: value = data[index] - index
  // data[128] for Manual is 0x80 (128). 128 - 128 = 0.
  const value = data[INDEX_128] - INDEX_128;

  switch (value) {
    case 0:
      return 'Manual';
    case 1:
      return 'Auto Faster';
    case 2:
      return 'Auto Fast';
    case 3:
      return 'Auto';
    case 4:
      return 'Auto Slow';
    case 5:
      return 'Auto Slower';
    default:
      console.warn(`Unknown Auto ISO Slowest Shutter Mode value: ${value}`);
      return 'Auto';
  }
}

export function encodeAutoIsoSlowestShutterMode(mode: AutoIsoSlowestShutterMode, data: Uint8Array): void {
  if (data.length <= INDEX_128) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Mode');
    return;
  }

  let value = 3; // Default 'Auto'
  switch (mode) {
    case 'Manual':
      value = 0;
      break;
    case 'Auto Faster':
      value = 1;
      break;
    case 'Auto Fast':
      value = 2;
      break;
    case 'Auto':
      value = 3;
      break;
    case 'Auto Slow':
      value = 4;
      break;
    case 'Auto Slower':
      value = 5;
      break;
  }

  // Golden Rule: data[index] = index + value
  data[INDEX_128] = (INDEX_128 + value) & 0xff;
}
