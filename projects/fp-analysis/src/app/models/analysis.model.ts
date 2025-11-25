export interface ScanData {
  valueName: string;
  byteData: Uint8Array;
}

export interface ScanSet {
  bytesDiff: number[];
  scans: ScanData[];
}
