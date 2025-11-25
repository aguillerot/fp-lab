const START_INDEX = 16;
const LENGTH = 2;

export function decodeShootingModeIcon(data: Uint8Array): string {
  if (data.length < START_INDEX + LENGTH) {
    console.warn('Buffer too short for Shooting Mode Icon');
    return '';
  }

  let icon = '';
  for (let i = START_INDEX; i < START_INDEX + LENGTH; i++) {
    // Golden Rule: value = data[index] - index
    const rawValue = data[i];
    const charCode = (rawValue - i) & 0xff;

    // 0 is EMPTY/Padding
    if (charCode === 0) {
      continue;
    }

    icon += String.fromCharCode(charCode);
  }

  return icon.trim();
}

export function encodeShootingModeIcon(icon: string, data: Uint8Array): void {
  if (data.length < START_INDEX + LENGTH) {
    console.warn('Buffer too short for Shooting Mode Icon');
    return;
  }

  // Truncate if too long
  const safeIcon = icon.slice(0, LENGTH);

  for (let i = 0; i < LENGTH; i++) {
    const dataIndex = START_INDEX + i;
    let charCode = 0;
    if (i < safeIcon.length) {
      charCode = safeIcon.charCodeAt(i);
    }

    // Golden Rule: data[index] = value + index
    data[dataIndex] = (charCode + dataIndex) & 0xff;
  }
}
