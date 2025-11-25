export enum IsoMode {
  Auto = 'auto',
  Manual = 'manual',
}

export type IsoStep = '1/3 EV' | '1 EV';

export type ShootingMode = 'M' | 'S' | 'A' | 'P';

export type AutoIsoSlowestShutterMode =
  | 'manual'
  | 'auto Faster'
  | 'auto Fast'
  | 'auto'
  | 'auto Slow'
  | 'auto Slower';

export type AeMeteringMode =
  | 'Evaluative Metering'
  | 'Center Weighted Average Metering'
  | 'Spot Metering';

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

export interface CameraSettings {
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
  // Add other settings as needed
  [key: string]: any;
}
