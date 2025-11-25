const WB_SHIFT_BA_OFFSET = 207; // 0xCF

// Axis B-A (Blue - Amber)
// B16 = 0xBF (-16)
// 0   = 0xCF (0)
// A16 = 0xDF (+16)
// Steps are typically in increments of 2 (e.g., B16, B14, ... B2, 0, A2, ... A16)

export function decodeWhiteBalanceShiftBA(data: Uint8Array): string {
  const value = data[WB_SHIFT_BA_OFFSET];
  const diff = value - WB_SHIFT_BA_OFFSET;

  console.log({ WB_SHIFT_BA_OFFSET, value, diff });

  if (diff === 0) return '0';
  if (diff < 0) return `B${Math.abs(diff)}`;
  return `A${diff}`;
}

export function encodeWhiteBalanceShiftBA(shift: string, data: Uint8Array): void {
  let value = WB_SHIFT_BA_OFFSET;
  if (shift === '0') {
    value = WB_SHIFT_BA_OFFSET;
  } else if (shift.startsWith('B')) {
    value -= parseInt(shift.substring(1), 10);
  } else if (shift.startsWith('A')) {
    value += parseInt(shift.substring(1), 10);
  }
  data[WB_SHIFT_BA_OFFSET] = value;
}
