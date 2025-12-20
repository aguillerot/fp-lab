import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hexAtIndexes',
})
export class HexAtIndexesPipe implements PipeTransform {
  transform(byteData: Uint8Array, indexes: number[]): string {
    // Extract bytes at specified indexes, convert to hex strings
    const selectedBytes = indexes.map((index) =>
      index < byteData.length ? byteData[index] : null,
    );
    const hexStrings = selectedBytes.map((byte) =>
      byte !== null ? ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase() : '??',
    );
    return hexStrings.join(' ');
  }

  //   private bytesToHexString(bytes: Uint8Array): string {
  //     return Array.from(bytes, (byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
  //       .join(' ')
  //       .toUpperCase();
  //   }
}
