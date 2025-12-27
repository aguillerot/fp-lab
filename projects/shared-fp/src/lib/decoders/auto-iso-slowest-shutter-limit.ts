const INDEX_129 = 129;
const INDEX_130 = 130;

export function decodeAutoIsoSlowestShutterLimit(data: Uint8Array): number {
  if (data.length <= INDEX_130) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Limit');
    return 1 / 30; // Default fallback
  }

  const b129 = data[INDEX_129];
  const b130 = data[INDEX_130];

  // 1. Remove offsets (Golden Rule)
  const lowRaw = (b129 - 129) & 0xff;
  const highRaw = (b130 - 130) & 0xff;

  // 2. Reconstruct internal value
  const internalVal = (highRaw << 8) | lowRaw;

  // 3. APEX Formula: Internal = Tv * 256
  // Tv = -log2(Time)
  // Internal = -log2(Time) * 256
  // Time = 2^(-Internal / 256)
  const seconds = Math.pow(2, -internalVal / 256);

  return snapToStandardShutterSpeed(seconds);
}

export function encodeAutoIsoSlowestShutterLimit(seconds: number, data: Uint8Array): void {
  if (data.length <= INDEX_130) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Limit');
    return;
  }

  // APEX Formula: Internal = -log2(Time) * 256
  const tv = -Math.log2(seconds);
  const internalVal = Math.round(tv * 256);

  // Split bytes
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Apply Golden Rule
  data[INDEX_129] = (lowByteRaw + 129) & 0xff;
  data[INDEX_130] = (highByteRaw + 130) & 0xff;
}

function snapToStandardShutterSpeed(value: number): number {
  // List of standard shutter speeds in seconds
  // Note: 0.6 is approx 2/3s, 0.3 is approx 1/3s
  const standardSpeeds = [
    1,
    0.8,
    2 / 3, // ~0.666 (User's 0.6)
    0.5,
    0.4,
    1 / 3, // ~0.333 (User's 0.3)
    1 / 4,
    1 / 5,
    1 / 6,
    1 / 8,
    1 / 10,
    1 / 13,
    1 / 15,
    1 / 20,
    1 / 25,
    1 / 30,
    1 / 40,
    1 / 50,
    1 / 60,
    1 / 80,
    1 / 100,
    1 / 125,
    1 / 160,
    1 / 200,
    1 / 250,
    1 / 320,
    1 / 400,
    1 / 500,
    1 / 640,
    1 / 800,
    1 / 1000,
    1 / 1250,
    1 / 1600,
    1 / 2000,
    1 / 2500,
    1 / 3200,
    1 / 4000,
    1 / 5000,
    1 / 6400,
    1 / 8000,
  ];

  return standardSpeeds.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
}
