import { WhiteBalanceMode } from '../models/camera-settings.model';

const WHITE_BALANCE_MODE_OFFSET = 206;

export function decodeWhiteBalanceMode(data: Uint8Array): WhiteBalanceMode {
  const value = data[WHITE_BALANCE_MODE_OFFSET];
  const index = value - WHITE_BALANCE_MODE_OFFSET;

  switch (index) {
    case 0:
      return 'Auto';
    case 1:
      return 'Auto light priority';
    case 2:
      return 'Daylight';
    case 3:
      return 'Shade';
    case 4:
      return 'Overcast';
    case 5:
      return 'Incandescent';
    case 6:
      return 'Fluorescent';
    case 7:
      return 'Flash';
    case 8:
      return 'Color Temperature';
    case 9:
      return 'Custom 1';
    case 10:
      return 'Custom 2';
    case 11:
      return 'Custom 3';
    default:
      return 'Auto';
  }
}

export function encodeWhiteBalanceMode(mode: WhiteBalanceMode, data: Uint8Array): void {
  let index = 0;
  switch (mode) {
    case 'Auto':
      index = 0;
      break;
    case 'Auto light priority':
      index = 1;
      break;
    case 'Daylight':
      index = 2;
      break;
    case 'Shade':
      index = 3;
      break;
    case 'Overcast':
      index = 4;
      break;
    case 'Incandescent':
      index = 5;
      break;
    case 'Fluorescent':
      index = 6;
      break;
    case 'Flash':
      index = 7;
      break;
    case 'Color Temperature':
      index = 8;
      break;
    case 'Custom 1':
      index = 9;
      break;
    case 'Custom 2':
      index = 10;
      break;
    case 'Custom 3':
      index = 11;
      break;
    default:
      index = 0;
      break;
  }
  data[WHITE_BALANCE_MODE_OFFSET] = WHITE_BALANCE_MODE_OFFSET + index;
}
