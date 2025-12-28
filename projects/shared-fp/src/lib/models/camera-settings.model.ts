import { AutoIsoSlowestShutterMode, IsoMode, IsoSensitivity, IsoSensitivityWithoutAuto, IsoStep } from './iso.model';
import { WhiteBalanceMode } from './white-balance.model';

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

export type CameraSettings = {
  isoMode: IsoMode;
  isoSensitivity: IsoSensitivity;
  exposureCompensation: number; // -5 to +5
  isoStep: IsoStep;
  lowIsoExpansion: boolean;
  highIsoExpansion: boolean;
  autoIsoLowerLimit: IsoSensitivityWithoutAuto;
  autoIsoUpperLimit: IsoSensitivityWithoutAuto;
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
  whiteBalanceShiftBA: number;
  whiteBalanceShiftMG: number;
};

export type StoredCameraSettings = {
  id: string;
  scannedAt: number;
  modifiedAt: number;
  qrCodeData: number[];
};
