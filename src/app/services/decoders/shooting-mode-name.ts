const NAME_LENGTH = 16;

export function decodeShootingModeName(data: Uint8Array): string {
  if (data.length < NAME_LENGTH) {
    console.warn('Buffer too short for Shooting Mode Name');
    return '';
  }

  let name = '';
  for (let i = 0; i < NAME_LENGTH; i++) {
    // Golden Rule: value = data[index] - index
    const rawValue = data[i];
    const charCode = (rawValue - i) & 0xff;

    // 0 is EMPTY/Padding
    if (charCode === 0) {
      continue;
    }

    name += String.fromCharCode(charCode);
  }

  return name.trim();
}

export function encodeShootingModeName(name: string, data: Uint8Array): void {
  if (data.length < NAME_LENGTH) {
    console.warn('Buffer too short for Shooting Mode Name');
    return;
  }

  // Truncate if too long
  const safeName = name.slice(0, NAME_LENGTH);

  for (let i = 0; i < NAME_LENGTH; i++) {
    let charCode = 0;
    if (i < safeName.length) {
      charCode = safeName.charCodeAt(i);
    }

    // Golden Rule: data[index] = value + index
    data[i] = (charCode + i) & 0xff;
  }
}
