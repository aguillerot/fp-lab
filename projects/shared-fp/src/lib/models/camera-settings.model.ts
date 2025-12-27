import { AutoIsoSlowestShutterMode, IsoMode, IsoStep } from './iso.model';

export type ShootingMode = 'M' | 'S' | 'A' | 'P';

export type AeMeteringMode = 'Evaluative Metering' | 'Center Weighted Average Metering' | 'Spot Metering';

export type DriveMode =
  | 'Single capture'
  | 'Continuous H'
  | 'Continuous M'
  | 'Continuous L'
  | 'Self timer 2s'
  | 'Self timer 10s'
  | 'Interval timer';

export type IntervalTimerTimes = 'Infinity' | number;

export type WhiteBalanceMode =
  | 'Auto'
  | 'Auto light priority'
  | 'Daylight'
  | 'Shade'
  | 'Overcast'
  | 'Incandescent'
  | 'Fluorescent'
  | 'Flash'
  | 'Color Temperature'
  | 'Custom 1'
  | 'Custom 2'
  | 'Custom 3';

export type CameraSettings = {
  isoMode: IsoMode;
  isoSensitivity: number | 'auto'; // 6, 8, 10... 102400 or 'auto'
  exposureCompensation: number; // -5 to +5
  isoStep: IsoStep;
  lowIsoExpansion: boolean;
  highIsoExpansion: boolean;
  autoIsoLowerLimit: number;
  autoIsoUpperLimit: number;
  autoIsoSlowestShutterMode: AutoIsoSlowestShutterMode;
  autoIsoSlowestShutterLimit: number;
  shootingModeName: string;
  shootingModeIcon: string;
  shootingMode: ShootingMode;
  aeMeteringMode: AeMeteringMode;
  driveMode: DriveMode;
  intervalTimerTimes: IntervalTimerTimes;
  intervalTimerDuration: number; // in seconds
  whiteBalanceMode: WhiteBalanceMode;
  whiteBalanceShiftBA: string;
  whiteBalanceShiftMG: string;
};

export type StoredCameraSettings = {
  id: string;
  scannedAt: number;
  settings: CameraSettings;
};
