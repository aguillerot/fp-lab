import { ShootingMode } from '../../models/camera-settings.model';

const INDEX_110 = 110;

export function decodeShootingMode(data: Uint8Array): ShootingMode {
  if (data.length <= INDEX_110) {
    console.warn('Buffer too short for Shooting Mode');
    return 'M'; // Default fallback
  }

  // Golden Rule: value = data[index] - index
  const value = data[INDEX_110] - INDEX_110;

  switch (value) {
    case 0:
      return 'M';
    case 1:
      return 'S';
    case 2:
      return 'A';
    case 3:
      return 'P';
    default:
      console.warn(`Unknown Shooting Mode value: ${value}`);
      return 'M';
  }
}

export function encodeShootingMode(mode: ShootingMode, data: Uint8Array): void {
  if (data.length <= INDEX_110) {
    console.warn('Buffer too short for Shooting Mode');
    return;
  }

  let value = 0;
  switch (mode) {
    case 'M':
      value = 0;
      break;
    case 'S':
      value = 1;
      break;
    case 'A':
      value = 2;
      break;
    case 'P':
      value = 3;
      break;
  }

  // Golden Rule: data[index] = value + index
  data[INDEX_110] = (value + INDEX_110) & 0xff;
}
