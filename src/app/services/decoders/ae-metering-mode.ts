import { AeMeteringMode } from '../../models/camera-settings.model';

const AE_METERING_MODE_OFFSET = 138;

export function decodeAeMeteringMode(data: Uint8Array): AeMeteringMode {
  const value = data[AE_METERING_MODE_OFFSET];
  const index = value - AE_METERING_MODE_OFFSET;

  switch (index) {
    case 0:
      return 'Evaluative Metering';
    case 1:
      return 'Center Weighted Average Metering';
    case 2:
      return 'Spot Metering';
    default:
      return 'Evaluative Metering'; // Default fallback
  }
}

export function encodeAeMeteringMode(mode: AeMeteringMode, data: Uint8Array): void {
  let index = 0;
  switch (mode) {
    case 'Evaluative Metering':
      index = 0;
      break;
    case 'Center Weighted Average Metering':
      index = 1;
      break;
    case 'Spot Metering':
      index = 2;
      break;
    default:
      index = 0;
      break;
  }
  data[AE_METERING_MODE_OFFSET] = AE_METERING_MODE_OFFSET + index;
}
