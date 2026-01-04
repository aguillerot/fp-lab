/**
 * Exposure Compensation Decoder/Encoder
 *
 * Photography Background:
 * - Exposure compensation adjusts the camera's metered exposure
 * - Measured in EV (Exposure Value) units, also called "stops"
 * - +1 EV = 2× more light (1 stop brighter)
 * - -1 EV = ½ light (1 stop darker)
 * - Typical range: -5 to +5 EV
 *
 * 1/3 Stop Increments:
 * - 0.0, ±0.3, ±0.7, ±1.0, ±1.3, ±1.7, ±2.0...
 * - Note: 0.3 and 0.7 are rounded displays of 1/3 and 2/3
 *
 * Encoding:
 * - Byte 119: Integer part + index offset (119)
 * - Byte 118: Fractional part encoded as steps × 85
 *   - step 0 (0.0): 118
 *   - step 1 (0.3): 203 (118 + 85)
 *   - step 2 (0.7): 32  (118 + 170) % 256
 */

const INDEX_118 = 118;
const INDEX_119 = 119;

/** Step increment for 1/3 stop (256 / 3 ≈ 85.33, rounded to 85) */
const STEP_INCREMENT = 85;

export function decodeExposureCompensation(data: Uint8Array): number {
  if (data.length <= INDEX_119) {
    console.warn('Buffer too short for exposure compensation');
    return 0;
  }

  const byte118 = data[INDEX_118];
  const byte119 = data[INDEX_119];

  // Byte 119 represents the integer part, offset by the index itself (119 / 0x77)
  const integerPart = byte119 - INDEX_119;

  // Byte 118 represents the fractional part
  // Index (118) -> 0.0
  // Index + 85 (203/0xCB) -> 0.3
  // Index + 170 (288%256 = 32/0x20) -> 0.7
  let fractionalPart = 0;

  // Calculate step from the byte value relative to the index
  // step = ((Value - Index + 256) % 256) / STEP_INCREMENT
  const step = ((byte118 - INDEX_118 + 256) % 256) / STEP_INCREMENT;

  if (Math.abs(step - 1) < 0.1) {
    fractionalPart = 0.3;
  } else if (Math.abs(step - 2) < 0.1) {
    fractionalPart = 0.7;
  }

  // Combine and round to 1 decimal place to handle floating point errors
  const value = integerPart + fractionalPart;
  return Math.round(value * 10) / 10;
}

export function encodeExposureCompensation(value: number, data: Uint8Array): void {
  if (data.length <= INDEX_119) {
    console.warn('Buffer too short for exposure compensation');
    return;
  }

  // Clamp value between -5 and +5
  const clampedValue = Math.max(-5, Math.min(5, value));

  // Calculate integer part (floor)
  // Note: Math.floor(-4.7) is -5, which is what we want because
  // -4.7 = -5 + 0.3
  const integerPart = Math.floor(clampedValue + 0.0001); // Add epsilon for float safety

  // Calculate fractional part
  const fractionalDiff = clampedValue - integerPart;

  // Determine step (0, 1, or 2) for the fractional part
  // 0.0 -> step 0
  // 0.3 -> step 1
  // 0.7 -> step 2
  let step = 0;
  if (fractionalDiff > 0.5) {
    step = 2; // ~0.7
  } else if (fractionalDiff > 0.15) {
    step = 1; // ~0.3
  }

  // Byte 119: Integer part + Index (119)
  data[INDEX_119] = integerPart + INDEX_119;

  // Byte 118: Formula (Index + step * STEP_INCREMENT) % 256
  // step 0 -> 118 (0x76)
  // step 1 -> 203 (0xCB)
  // step 2 -> 32  (0x20)
  data[INDEX_118] = (INDEX_118 + step * STEP_INCREMENT) % 256;
}
