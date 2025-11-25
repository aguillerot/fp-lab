const INDEX_124 = 124;
const INDEX_125 = 125;

export function decodeAutoIsoLowerLimit(data: Uint8Array): number {
  if (data.length <= INDEX_125) {
    console.warn('Buffer too short for Auto ISO Lower Limit');
    return 100; // Default fallback
  }

  const b124 = data[INDEX_124];
  const b125 = data[INDEX_125];

  // 1. Remove offsets (Golden Rule)
  const lowRaw = (b124 - 124) & 0xff;
  const highRaw = (b125 - 125) & 0xff;

  // 2. Reconstruct internal value
  const internalVal = (highRaw << 8) | lowRaw;

  // 3. Logarithmic Formula
  // ISO = 3.125 * 2^(val / 256)
  const iso = 3.125 * Math.pow(2, internalVal / 256);

  return snapToStandardIso(iso);
}

export function encodeAutoIsoLowerLimit(iso: number, data: Uint8Array): void {
  if (data.length <= INDEX_125) {
    console.warn('Buffer too short for Auto ISO Lower Limit');
    return;
  }

  // Logarithmic Formula
  const stops = Math.log2(iso / 3.125);
  let internalVal = Math.round(stops * 256);

  // Correction for 2/3 stop precision to match Sigma's table (0x20 vs 0x2A)
  // Sigma uses raw 164 for 2/3 stop, formula gives ~174
  // We check the fractional part (low byte)
  const lowByte = internalVal & 0xff;
  if (lowByte >= 170 && lowByte <= 178) {
    // Force it to 164 (which results in 0x20 after +124 offset)
    internalVal = (internalVal & 0xff00) | 164;
  }

  // Split bytes
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Apply Golden Rule
  data[INDEX_124] = (lowByteRaw + 124) & 0xff;
  data[INDEX_125] = (highByteRaw + 125) & 0xff;
}

function snapToStandardIso(value: number): number {
  const standardIsos = [
    100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000,
    5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200, 64000, 80000,
  ];
  return standardIsos.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
  );
}
