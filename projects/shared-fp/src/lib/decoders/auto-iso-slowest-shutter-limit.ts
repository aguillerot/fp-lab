/**
 * Auto ISO Slowest Shutter Speed Limit Decoder/Encoder
 *
 * Photography Background:
 * - Shutter speed follows a reciprocal doubling pattern
 * - Full stops: 1s → 1/2 → 1/4 → 1/8 → 1/15 → 1/30 → 1/60 → 1/125...
 * - Each halving of time = 1 stop less light
 * - Note: Some values are rounded (1/15 not 1/16, 1/125 not 1/128)
 *
 * APEX Time Value (Tv):
 * - Tv = -log₂(t) where t is exposure time in seconds
 * - Tv = 0 → 1s, Tv = 1 → 1/2s, Tv = 5 → 1/30s, Tv = 6 → 1/60s
 * - Tv increases as shutter speed gets faster
 *
 * Encoding:
 * - Uses: internalVal = Tv × 256
 * - Each 256 units = 1 stop (halving of exposure time)
 * - Each ~85 units = 1/3 stop
 * - Bytes 129-130 with "Golden Rule" offset
 */

const INDEX_129 = 129;
const INDEX_130 = 130;

/** Units per stop in the internal encoding (256 = 1 Tv) */
const UNITS_PER_STOP = 256;

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

  // 3. APEX Time Value (Tv) formula:
  // internalVal = Tv × 256 = -log₂(time) × 256
  // Therefore: time = 2^(-internalVal / 256)
  //
  // Examples:
  // internalVal = 0     → 1s    (2^0)
  // internalVal = 256   → 1/2s  (2^-1)
  // internalVal = 1280  → 1/32s (2^-5, displayed as 1/30)
  // internalVal = 1536  → 1/64s (2^-6, displayed as 1/60)
  const seconds = Math.pow(2, -internalVal / UNITS_PER_STOP);

  return snapToStandardShutterSpeed(seconds);
}

export function encodeAutoIsoSlowestShutterLimit(seconds: number, data: Uint8Array): void {
  if (data.length <= INDEX_130) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Limit');
    return;
  }

  // APEX Tv formula: internalVal = -log₂(time) × UNITS_PER_STOP
  // Faster shutter speeds have higher Tv values
  const tv = -Math.log2(seconds);
  const internalVal = Math.round(tv * UNITS_PER_STOP);

  // Split bytes
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Apply Golden Rule
  data[INDEX_129] = (lowByteRaw + 129) & 0xff;
  data[INDEX_130] = (highByteRaw + 130) & 0xff;
}

/**
 * Standard shutter speeds in 1/3 stop increments.
 *
 * The sequence follows: t_n = 2^(-n/3) seconds
 * Values are conventionally rounded for display:
 * - 1/15 instead of 1/16 (2^-4)
 * - 1/30 instead of 1/32 (2^-5)
 * - 1/60 instead of 1/64 (2^-6)
 * - 1/125 instead of 1/128 (2^-7)
 *
 * Note: 0.6s ≈ 2/3s, 0.3s ≈ 1/3s (1/3 stop positions)
 */
function snapToStandardShutterSpeed(value: number): number {
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
