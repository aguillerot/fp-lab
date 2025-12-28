const WB_SHIFT_BA_OFFSET = 207; // 0xCF

// Axis B-A (Blue - Amber)
// B16 = 0xBF (-16)
// 0   = 0xCF (0)
// A16 = 0xDF (+16)
// Steps are typically in increments of 2 (e.g., B16, B14, ... B2, 0, A2, ... A16)

export function decodeWhiteBalanceShiftBA(data: Uint8Array): number {
  const value = data[WB_SHIFT_BA_OFFSET];
  const diff = value - WB_SHIFT_BA_OFFSET;
  return diff;
}

export function encodeWhiteBalanceShiftBA(shift: number, data: Uint8Array): void {
  data[WB_SHIFT_BA_OFFSET] = WB_SHIFT_BA_OFFSET + shift;
}
