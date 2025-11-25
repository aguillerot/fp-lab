const INDEX_121 = 121;
const INDEX_122 = 122;

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

  // 3. Inverser la formule Logarithmique
  // ISO = 3.125 * 2^(val / 256)
  const iso = 3.125 * Math.pow(2, internalVal / 256);

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
    // Formule Logarithmique
    // Math.log2(x) est équivalent à Math.log(x) / Math.log(2)
    const stops = Math.log2(iso / 3.125);
    internalVal = Math.round(stops * 256);
  }

  // Séparation des octets
  const lowByteRaw = internalVal & 0xff;
  const highByteRaw = (internalVal >> 8) & 0xff;

  // Application de la Règle d'Or (Colonnes 121 et 122)
  data[INDEX_121] = (lowByteRaw + 121) & 0xff; // 121 = 0x79
  data[INDEX_122] = (highByteRaw + 122) & 0xff; // 122 = 0x7A
}

function snapToStandardIso(value: number): number {
  const standardIsos = [
    6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800,
    1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600,
    32000, 40000, 51200, 64000, 80000, 102400,
  ];
  return standardIsos.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
  );
}
