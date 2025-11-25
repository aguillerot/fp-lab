import { IsoMode } from '../models/camera-settings.model';

const INDEX_120 = 120;
// Manual mode value matches the index (120 / 0x78)
// Auto mode value is index + 1 (121 / 0x79)

export function decodeIsoMode(data: Uint8Array): IsoMode {
  if (data.length <= INDEX_120) {
    console.warn('Buffer too short for ISO mode');
    return IsoMode.Auto;
  }

  const value = data[INDEX_120];
  if (value === INDEX_120) {
    return IsoMode.Manual;
  }

  return IsoMode.Auto;
}

export function encodeIsoMode(mode: IsoMode, data: Uint8Array): void {
  if (data.length <= INDEX_120) {
    console.warn('Buffer too short for ISO mode');
    return;
  }

  if (mode === IsoMode.Manual) {
    data[INDEX_120] = INDEX_120;
  } else {
    data[INDEX_120] = INDEX_120 + 1;
  }
}
