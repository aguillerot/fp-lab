import { CameraSettings } from '../models/camera-settings.model';

const INDEX_123 = 123;
const BASE_VALUE = 123; // 0x7B

export function decodeIsoConfiguration(data: Uint8Array): Partial<CameraSettings> {
  if (data.length <= INDEX_123) {
    console.warn('Buffer too short for ISO configuration');
    return {
      isoStep: '1 EV',
      lowIsoExpansion: false,
      highIsoExpansion: false,
    };
  }

  const value = data[INDEX_123] - BASE_VALUE;

  // Bit 0: ISO Step (0 = 1 EV, 1 = 1/3 EV)
  const is1_3Ev = (value & 1) === 1;
  // Bit 1: Low ISO Expansion (0 = OFF, 1 = ON)
  const isLowOn = (value & 2) === 2;
  // Bit 2: High ISO Expansion (0 = OFF, 1 = ON)
  const isHighOn = (value & 4) === 4;

  return {
    isoStep: is1_3Ev ? '1/3 EV' : '1 EV',
    lowIsoExpansion: isLowOn,
    highIsoExpansion: isHighOn,
  };
}

export function encodeIsoConfiguration(settings: CameraSettings, data: Uint8Array): void {
  if (data.length <= INDEX_123) {
    console.warn('Buffer too short for ISO configuration');
    return;
  }

  let value = 0;
  if (settings.isoStep === '1/3 EV') value |= 1;
  if (settings.lowIsoExpansion) value |= 2;
  if (settings.highIsoExpansion) value |= 4;

  data[INDEX_123] = BASE_VALUE + value;
}
