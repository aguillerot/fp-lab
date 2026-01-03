import { Aperture } from '../models/aperture.model';

/**
 * Aperture (f-stop) Decoder/Encoder
 *
 * Photography Background:
 * - F-number = focal length / aperture diameter (N = f/D)
 * - The f-stop scale follows powers of √2 (≈ 1.414)
 * - Each full stop: f/1 → f/1.4 → f/2 → f/2.8 → f/4 → f/5.6 → f/8...
 * - Formula: f_n = f_0 × (√2)^n = f_0 × 2^(n/2)
 *
 * Light relationship:
 * - Lower f-number = larger aperture = MORE light = shallower DoF
 * - Higher f-number = smaller aperture = LESS light = deeper DoF
 * - Light intensity ∝ 1/N² (inverse square of f-number)
 * - Each full stop halves/doubles the light
 *
 * APEX Aperture Value (Av):
 * - Av = log₂(N²) = 2 × log₂(N)
 * - Av = 0 → f/1, Av = 1 → f/1.4, Av = 2 → f/2, Av = 3 → f/2.8...
 *
 * Encoding:
 * - Uses: internalVal = 512 × log₂(f-number)
 * - This is equivalent to: internalVal = Av × 256
 * - Each 256 units = 1 stop, each ~85 units = 1/3 stop
 */

const INDEX_116 = 116;
const INDEX_117 = 117;

/**
 * Standard aperture values in 1/3 stop increments.
 *
 * The sequence follows: f_n = 2^(n/6) where n is the 1/3 stop index
 * - n=0: f/1.0, n=2: f/1.4, n=4: f/2.0, n=6: f/2.8...
 *
 * Rounded for display:
 * - f/1.4 is actually √2 ≈ 1.414
 * - f/2.8 is actually 2√2 ≈ 2.828
 * - f/5.6 is actually 4√2 ≈ 5.657
 */
const STANDARD_APERTURES: Aperture[] = [
  'f/1.4',
  'f/1.6',
  'f/1.8',
  'f/2.0',
  'f/2.2',
  'f/2.5',
  'f/2.8',
  'f/3.2',
  'f/3.5',
  'f/4.0',
  'f/4.5',
  'f/5.0',
  'f/5.6',
  'f/6.3',
  'f/7.1',
  'f/8.0',
  'f/9.0',
  'f/10',
  'f/11',
  'f/13',
  'f/14',
  'f/16',
  'f/18',
  'f/20',
  'f/22',
];

// Known aperture byte mappings from QR code analysis
// Format: [byte116 (hex), byte117 (hex)] -> aperture value
// Byte 116 and 117 follow the "Golden Rule" offset pattern
const KNOWN_APERTURES = new Map<string, Aperture>([
  ['6C-77', 'f/2.8'], // 0x6C=108, 0x77=119
  ['CF-78', 'f/3.2'], // 0xCF=207, 0x78=120
  ['11-78', 'f/3.5'], // 0x11=17,  0x78=120
  ['74-79', 'f/4.0'], // 0x74=116, 0x79=121
  ['5F-7D', 'f/22'], // 0x5F=95,  0x7D=125
]);

// Reverse map for encoding
const APERTURE_TO_BYTES = new Map<Aperture, [number, number]>([
  ['f/2.8', [0x6c, 0x77]],
  ['f/3.2', [0xcf, 0x78]],
  ['f/3.5', [0x11, 0x78]],
  ['f/4.0', [0x74, 0x79]],
  ['f/22', [0x5f, 0x7d]],
]);

/**
 * Decodes aperture value from QR code data.
 *
 * The encoding uses two bytes (116-117) with a logarithmic scale similar to ISO.
 * Formula: Aperture = baseValue * 2^(internalVal / 256)
 *
 * Note: Some aperture values have unknown byte mappings.
 * The decoder will attempt to calculate using the logarithmic formula,
 * falling back to a lookup table for known values.
 */
export function decodeAperture(data: Uint8Array): Aperture {
  if (data.length <= INDEX_117) {
    console.warn('Buffer too short for aperture');
    return 'f/2.8';
  }

  const b116 = data[INDEX_116];
  const b117 = data[INDEX_117];

  // Apply "Golden Rule" - subtract index offset
  const lowRaw = (b116 - INDEX_116) & 0xff;
  const highRaw = (b117 - INDEX_117) & 0xff;

  // Reconstruct internal value
  const internalVal = (highRaw << 8) | lowRaw;

  // Logarithmic formula using APEX Av (Aperture Value):
  // internalVal = Av × 256 = 2 × log₂(N) × 256 = 512 × log₂(N)
  // Therefore: N = 2^(internalVal / 512)
  //
  // F-number follows √2 progression per stop:
  // internalVal = 0    → f/1.0 (2^0)
  // internalVal = 256  → f/1.4 (2^0.5 = √2)
  // internalVal = 512  → f/2.0 (2^1)
  // internalVal = 768  → f/2.8 (2^1.5 = 2√2)
  const aperture = Math.pow(2, internalVal / 512);

  return snapToStandardAperture(aperture);
}

/**
 * Encodes aperture value into QR code data.
 *
 * Note: Only known aperture values can be reliably encoded.
 * Unknown values will use the logarithmic formula which may not be accurate.
 */
export function encodeAperture(aperture: Aperture, data: Uint8Array): void {
  if (data.length <= INDEX_117) {
    console.warn('Buffer too short for aperture');
    return;
  }

  // Calculate using logarithmic formula (may not be accurate for all values)
  // internalVal = 512 * log2(aperture)
  const numericAperture = parseApertureToNumber(aperture);
  const internalVal = Math.round(512 * Math.log2(numericAperture));

  // Separate bytes
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Apply "Golden Rule" - add index offset
  data[INDEX_116] = (lowByteRaw + INDEX_116) & 0xff;
  data[INDEX_117] = (highByteRaw + INDEX_117) & 0xff;
}

/**
 * Parses an Aperture string to its numeric value.
 */
function parseApertureToNumber(aperture: Aperture): number {
  return parseFloat(aperture.replace('f/', ''));
}

/**
 * Snaps a calculated aperture value to the nearest standard aperture.
 */
function snapToStandardAperture(value: number): Aperture {
  return STANDARD_APERTURES.reduce((prev, curr) => {
    const prevNum = parseApertureToNumber(prev);
    const currNum = parseApertureToNumber(curr);
    return Math.abs(currNum - value) < Math.abs(prevNum - value) ? curr : prev;
  });
}
