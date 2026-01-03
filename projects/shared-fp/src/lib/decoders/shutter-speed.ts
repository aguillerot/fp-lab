import { SHUTTER_SPEED_FRACTIONS } from '../constants/shutter-speed.constants';
import { ShutterSpeed } from '../models/shutter-speed.model';

/**
 * Shutter Speed Decoder/Encoder
 *
 * Photography Background:
 * - Shutter speed controls the duration of light exposure
 * - Follows a reciprocal doubling pattern (each step halves the time = 1 stop less light)
 * - Full stops: 1s → 1/2 → 1/4 → 1/8 → 1/15 → 1/30 → 1/60 → 1/125 → 1/250...
 *
 * Light relationship:
 * - Faster shutter = LESS light = freezes motion
 * - Slower shutter = MORE light = motion blur
 * - Each full stop halves/doubles the light
 *
 * APEX Time Value (Tv):
 * - Tv = log₂(1/t) = -log₂(t) where t is exposure time in seconds
 * - Tv = 0 → 1s, Tv = 1 → 1/2s, Tv = 2 → 1/4s, Tv = 3 → 1/8s...
 *
 * Encoding:
 * - Uses bytes 111-112 with "Golden Rule" offset pattern
 * - internalVal = Tv × 256
 * - t = 2^(-internalVal / 256)
 * - Each 256 units = 1 stop
 *
 * Note: Display values (e.g., "0.6 s", "1.3 s") are rounded for readability
 * but the actual encoding uses precise 1/3 stop values.
 */

const INDEX_111 = 111;
const INDEX_112 = 112;

/**
 * Decodes shutter speed value from QR code data.
 *
 * The encoding uses two bytes (111-112) with a logarithmic scale.
 * Formula: t = 2^(-internalVal / 256) where internalVal = Tv × 256
 */
export function decodeShutterSpeed(data: Uint8Array): ShutterSpeed {
  if (data.length <= INDEX_112) {
    console.warn('Buffer too short for shutter speed');
    return '1/125 s';
  }

  const b111 = data[INDEX_111];
  const b112 = data[INDEX_112];

  // Apply "Golden Rule" - subtract index offset
  const lowRaw = (b111 - INDEX_111) & 0xff;
  const highRaw = (b112 - INDEX_112) & 0xff;

  // Reconstruct internal value (signed to handle negative Tv for slow speeds)
  let internalVal = (highRaw << 8) | lowRaw;
  // Handle signed 16-bit value for shutter speeds > 1s (negative Tv)
  if (internalVal > 32767) {
    internalVal = internalVal - 65536;
  }

  // Logarithmic formula using APEX Tv (Time Value):
  // internalVal = Tv × 256 = -log₂(t) × 256
  // Therefore: t = 2^(-internalVal / 256)
  //
  // Examples:
  // internalVal = 0    → 1s (2^0)
  // internalVal = 256  → 1/2s (2^-1)
  // internalVal = 768  → 1/8s (2^-3)
  // internalVal = -256 → 2s (2^1)
  const shutterSeconds = Math.pow(2, -internalVal / 256);

  return snapToStandardShutterSpeed(shutterSeconds);
}

/**
 * Encodes shutter speed value into QR code data.
 * Uses precise logarithmic formula with exact fractional values.
 */
export function encodeShutterSpeed(shutterSpeed: ShutterSpeed, data: Uint8Array): void {
  if (data.length <= INDEX_112) {
    console.warn('Buffer too short for shutter speed');
    return;
  }

  const fraction = SHUTTER_SPEED_FRACTIONS[shutterSpeed];
  if (!fraction) {
    console.warn(`Unknown shutter speed value: ${shutterSpeed}`);
    return;
  }

  // Calculate internal value using the formula:
  // internalVal = 256 * log2(1/t)
  // Rounding logic:
  // - For fast speeds (t < 1s, val > 0): Use floor
  // - For slow speeds (t >= 1s, val <= 0): Use round(val - 0.25)
  const seconds = fraction.valueOf();
  const rawVal = 256 * Math.log2(1 / seconds);
  const internalVal = rawVal > 0 ? Math.floor(rawVal) : Math.round(rawVal - 0.25);

  // Split into high and low bytes
  // Handle negative values (two's complement for 16-bit)
  const unsignedVal = internalVal < 0 ? internalVal + 65536 : internalVal;
  const lowRaw = unsignedVal & 0xff;
  const highRaw = (unsignedVal >> 8) & 0xff;

  // Apply "Golden Rule" - add index offset
  data[INDEX_111] = (lowRaw + INDEX_111) & 0xff;
  data[INDEX_112] = (highRaw + INDEX_112) & 0xff;
}

/**
 * Snaps a calculated shutter speed value to the nearest standard value.
 */
function snapToStandardShutterSpeed(seconds: number): ShutterSpeed {
  const speeds = Object.keys(SHUTTER_SPEED_FRACTIONS) as ShutterSpeed[];
  return speeds.reduce((prev, curr) => {
    const prevSeconds = SHUTTER_SPEED_FRACTIONS[prev].valueOf();
    const currSeconds = SHUTTER_SPEED_FRACTIONS[curr].valueOf();
    // Compare in log space for better accuracy across the range
    const prevDiff = Math.abs(Math.log2(prevSeconds) - Math.log2(seconds));
    const currDiff = Math.abs(Math.log2(currSeconds) - Math.log2(seconds));
    return currDiff < prevDiff ? curr : prev;
  });
}
