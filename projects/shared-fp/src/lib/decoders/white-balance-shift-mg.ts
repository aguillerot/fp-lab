const WB_SHIFT_MG_OFFSET = 208; // 0xD0

// Axis M-G (Magenta - Green)
// G16 = 0xC0 (-16)
// 0   = 0xD0 (0)
// M16 = 0xE0 (+16)
// Steps are typically in increments of 2 (e.g., G16, G14, ... G2, 0, M2, ... M16)

export function decodeWhiteBalanceShiftMG(data: Uint8Array): number {
  const value = data[WB_SHIFT_MG_OFFSET];
  const diff = value - WB_SHIFT_MG_OFFSET;
  return diff;
}

export function encodeWhiteBalanceShiftMG(shift: number, data: Uint8Array): void {
  data[WB_SHIFT_MG_OFFSET] = WB_SHIFT_MG_OFFSET + shift;
}
