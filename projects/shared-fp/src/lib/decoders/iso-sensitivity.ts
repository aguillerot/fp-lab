/**
 * ISO Sensitivity Decoder/Encoder
 *
 * Photography Background:
 * - ISO follows a linear doubling scale: each doubling = 1 stop more sensitivity
 * - Full stops: 100 → 200 → 400 → 800 → 1600 → 3200 → 6400...
 * - 1/3 stop scale: 100 → 125 → 160 → 200 → 250 → 320 → 400...
 * - Formula: ISO_n = ISO_base × 2^(n/3) for 1/3 stop increments
 *
 * Encoding:
 * - Uses logarithmic formula: internalVal = log₂(ISO / 3.125) × 256
 * - Bytes 121-122 store a 16-bit value with "Golden Rule" offset
 * - Each 256 units = 1 stop (doubling of ISO)
 * - Each 85.33 units ≈ 1/3 stop
 */

const INDEX_121 = 121;
const INDEX_122 = 122;

/** Base value for ISO calculation: 3.125 × 2^5 = 100 (base ISO) */
const ISO_BASE = 3.125;

/** Units per stop in the internal encoding (256 = 1 EV) */
const UNITS_PER_STOP = 256;

export function decodeIsoSensitivity(data: Uint8Array): number | 'auto' {
  if (data.length <= INDEX_122) {
    console.warn('Buffer too short for ISO sensitivity');
    return 'auto';
  }

  const b121 = data[INDEX_121];
  const b122 = data[INDEX_122];

  // 1. Retirer les offsets (Règle d'or inversée)
  const lowRaw = (b121 - 121) & 0xff;
  const highRaw = (b122 - 122) & 0xff;

  // 2. Reconstruire la valeur interne
  const internalVal = (highRaw << 8) | lowRaw;

  // Cas spécial Auto
  if (internalVal === 0) return 'auto';

  // 3. Apply logarithmic formula
  // ISO = ISO_BASE × 2^(internalVal / UNITS_PER_STOP)
  // Example: internalVal = 1280 → ISO = 3.125 × 2^5 = 100
  //          internalVal = 1536 → ISO = 3.125 × 2^6 = 200 (1 stop higher)
  const iso = ISO_BASE * Math.pow(2, internalVal / UNITS_PER_STOP);

  // On arrondit pour éviter les flottants bizarres (ex: 99.99999)
  return snapToStandardIso(iso);
}

export function encodeIsoSensitivity(iso: number | 'auto', data: Uint8Array): void {
  if (data.length <= INDEX_122) {
    console.warn('Buffer too short for ISO sensitivity');
    return;
  }

  let internalVal: number;

  // Cas spécial : "Auto" semble être 0 (donne 79 7A)
  if (iso === 'auto' || iso === 0) {
    internalVal = 0;
  } else {
    // Logarithmic formula: internalVal = log₂(ISO / ISO_BASE) × UNITS_PER_STOP
    // Each stop (doubling) adds 256 units
    // Each 1/3 stop adds ~85.33 units
    const stops = Math.log2(iso / ISO_BASE);
    internalVal = Math.round(stops * UNITS_PER_STOP);
  }

  // Séparation des octets
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Application de la Règle d'Or (Colonnes 121 et 122)
  data[INDEX_121] = (lowByteRaw + 121) & 0xff; // 121 = 0x79
  data[INDEX_122] = (highByteRaw + 122) & 0xff; // 122 = 0x7A
}

/**
 * Standard ISO values in 1/3 stop increments.
 *
 * The sequence follows: ISO_n = 100 × 2^(n/3)
 * - n=0: 100, n=1: 125, n=2: 160, n=3: 200 (1 stop), etc.
 *
 * Extended range (Lo/Hi):
 * - Lo: 6-80 (below base ISO, interpolated)
 * - Standard: 100-25600
 * - Hi: 32000-102400 (above native range, interpolated)
 */
const STANDARD_ISOS = [
  // Extended Low (Lo) - below native sensor sensitivity
  6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80,
  // Standard range - native sensor sensitivity
  100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000,
  12800, 16000, 20000, 25600,
  // Extended High (Hi) - amplified beyond native range
  32000, 40000, 51200, 64000, 80000, 102400,
];

function snapToStandardIso(value: number): number {
  return STANDARD_ISOS.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
}
