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

import { SHUTTER_SPEED_FRACTIONS } from 'fp-shared/constants';
import { ShutterSpeed } from 'fp-shared/models';

const INDEX_129 = 129;
const INDEX_130 = 130;

/** Units per stop in the internal encoding (256 = 1 Tv) */
const UNITS_PER_STOP = 256;

export function decodeAutoIsoSlowestShutterLimit(data: Uint8Array): ShutterSpeed {
  if (data.length <= INDEX_130) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Limit');
    return '1/125 s'; // Default fallback
  }

  const b129 = data[INDEX_129];
  const b130 = data[INDEX_130];

  // 1. Remove offsets (Golden Rule)
  const lowRaw = (b129 - 129) & 0xff;
  const highRaw = (b130 - 130) & 0xff;

  // 2. Reconstruct internal value
  const internalVal = (highRaw << 8) | lowRaw;

  // Logarithmic formula using APEX Tv (Time Value):
  // internalVal = Tv × 256 = -log₂(t) × 256
  // Therefore: t = 2^(-internalVal / 256)
  //
  // Examples:
  // internalVal = 0    → 1s (2^0)
  // internalVal = 256  → 1/2s (2^-1)
  // internalVal = 768  → 1/8s (2^-3)
  const seconds = Math.pow(2, -internalVal / UNITS_PER_STOP);

  return snapToStandardShutterSpeed(seconds);
}

export function encodeAutoIsoSlowestShutterLimit(shutterSpeed: ShutterSpeed, data: Uint8Array): void {
  if (data.length <= INDEX_130) {
    console.warn('Buffer too short for Auto ISO Slowest Shutter Limit');
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
  const lowRaw = internalVal & 0xff;
  const highRaw = (internalVal >> 8) & 0xff;

  // Apply "Golden Rule" - add index offset
  data[INDEX_129] = (lowRaw + INDEX_129) & 0xff;
  data[INDEX_130] = (highRaw + INDEX_130) & 0xff;
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
