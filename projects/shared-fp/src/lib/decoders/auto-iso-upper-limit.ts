const INDEX_126 = 126;
const INDEX_127 = 127;

export function decodeAutoIsoUpperLimit(data: Uint8Array): number {
  if (data.length <= INDEX_127) {
    console.warn('Buffer too short for Auto ISO Upper Limit');
    return 6400; // Default fallback
  }

  const b126 = data[INDEX_126];
  const b127 = data[INDEX_127];

  // 1. Remove offsets (Golden Rule)
  const lowRaw = (b126 - 126) & 0xff;
  const highRaw = (b127 - 127) & 0xff;

  // 2. Reconstruct internal value
  const internalVal = (highRaw << 8) | lowRaw;

  // 3. Logarithmic Formula
  // ISO = 3.125 * 2^(val / 256)
  const iso = 3.125 * Math.pow(2, internalVal / 256);

  return snapToStandardIso(iso);
}

export function encodeAutoIsoUpperLimit(iso: number, data: Uint8Array): void {
  if (data.length <= INDEX_127) {
    console.warn('Buffer too short for Auto ISO Upper Limit');
    return;
  }

  // Logarithmic Formula
  const stops = Math.log2(iso / 3.125);
  let internalVal = Math.round(stops * 256);

  // Correction for 2/3 stop precision to match Sigma's table (0x2B vs 0x2C)
  // Sigma uses raw 173 (0xAD) for 2/3 stop, formula gives ~174 (0xAE)
  // We check the fractional part (low byte)
  const lowByte = internalVal & 0xff;
  if (lowByte >= 173 && lowByte <= 175) {
    // Force it to 173 (which results in 0x2B after +126 offset)
    internalVal = (internalVal & 0xff00) | 173;
  }

  // Split bytes
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Apply Golden Rule
  data[INDEX_126] = (lowByteRaw + 126) & 0xff;
  data[INDEX_127] = (highByteRaw + 127) & 0xff;
}

function snapToStandardIso(value: number): number {
  const standardIsos = [
    100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000,
    12800, 16000, 20000, 25600, 32000, 40000, 51200, 64000, 80000, 102400,
  ];
  return standardIsos.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
}
