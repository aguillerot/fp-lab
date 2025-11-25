import { DriveMode } from '../../models/camera-settings.model';

const DRIVE_MODE_OFFSET = 139;

export function decodeDriveMode(data: Uint8Array): DriveMode {
  const value = data[DRIVE_MODE_OFFSET];
  const index = value - DRIVE_MODE_OFFSET;

  switch (index) {
    case 0:
      return 'Single capture';
    case 1:
      return 'Continuous H';
    case 2:
      return 'Continuous M';
    case 3:
      return 'Continuous L';
    case 4:
      return 'Self timer 2s';
    case 5:
      return 'Self timer 10s';
    case 6:
      return 'Interval timer';
    default:
      return 'Single capture'; // Default fallback
  }
}

export function encodeDriveMode(mode: DriveMode, data: Uint8Array): void {
  let index = 0;
  switch (mode) {
    case 'Single capture':
      index = 0;
      break;
    case 'Continuous H':
      index = 1;
      break;
    case 'Continuous M':
      index = 2;
      break;
    case 'Continuous L':
      index = 3;
      break;
    case 'Self timer 2s':
      index = 4;
      break;
    case 'Self timer 10s':
      index = 5;
      break;
    case 'Interval timer':
      index = 6;
      break;
    default:
      index = 0;
      break;
  }
  data[DRIVE_MODE_OFFSET] = DRIVE_MODE_OFFSET + index;
}
