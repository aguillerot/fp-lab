export type ScanData = {
  valueName: string;
  byteData: Uint8Array;
};

export type ScanSet = {
  bytesDiff: number[];
  scans: ScanData[];
};
