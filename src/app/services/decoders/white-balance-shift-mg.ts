const WB_SHIFT_MG_OFFSET = 208; // 0xD0

// Axis M-G (Magenta - Green)
// G16 = 0xC0 (-16)
// 0   = 0xD0 (0)
// M16 = 0xE0 (+16)
// Steps are typically in increments of 2 (e.g., G16, G14, ... G2, 0, M2, ... M16)

export function decodeWhiteBalanceShiftMG(data: Uint8Array): string {
  const value = data[WB_SHIFT_MG_OFFSET];
  const diff = value - WB_SHIFT_MG_OFFSET;

  if (diff === 0) return '0';
  if (diff < 0) return `G${Math.abs(diff)}`;
  return `M${diff}`;
}

export function encodeWhiteBalanceShiftMG(shift: string, data: Uint8Array): void {
  let value = WB_SHIFT_MG_OFFSET;
  if (shift === '0') {
    value = WB_SHIFT_MG_OFFSET;
  } else if (shift.startsWith('G')) {
    value -= parseInt(shift.substring(1), 10);
  } else if (shift.startsWith('M')) {
    value += parseInt(shift.substring(1), 10);
  }
  data[WB_SHIFT_MG_OFFSET] = value;
}
