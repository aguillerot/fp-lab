import { Pipe, PipeTransform } from '@angular/core';

function bytesToHexString(bytes: Uint8Array): string {
  return Array.from(bytes, byte => ('0' + (byte & 0xff).toString(16)).slice(-2))
    .join(' ')
    .toUpperCase();
}

@Pipe({
  name: 'bytesToHex',
})
export class BytesToHexPipe implements PipeTransform {
  transform(byteData: Uint8Array): string {
    return bytesToHexString(byteData);
  }
}
