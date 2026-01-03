import { ShutterSpeed } from 'fp-shared/models';
import { IsoSensitivity, IsoStep } from '../models/iso.model';

export const standardIsoSensitivityOptions: IsoSensitivity[] = [
  100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000,
  12800, 16000, 20000, 25600,
];
export const lowIsoSensitivityOptions: IsoSensitivity[] = [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80];
export const highIsoSensitivityOptions: IsoSensitivity[] = [32000, 40000, 51200, 64000, 80000, 102400];
export const allIsoSensitivityOptions: IsoSensitivity[] = [
  ...lowIsoSensitivityOptions,
  ...standardIsoSensitivityOptions,
  ...highIsoSensitivityOptions,
];
export const autoAndAllIsoSensitivityOptions: IsoSensitivity[] = [
  'auto',
  ...lowIsoSensitivityOptions,
  ...standardIsoSensitivityOptions,
  ...highIsoSensitivityOptions,
];

export const isoSensitivityStepOptions: IsoStep[] = ['1/3 EV', '1 EV'];

export const slowestIsoShutterSpeedLimitOptions: ShutterSpeed[] = [
  '30 s',
  '25 s',
  '20 s',
  '15 s',
  '13 s',
  '10 s',
  '8 s',
  '6 s',
  '5 s',
  '4 s',
  '3.2 s',
  '2.5 s',
  '2 s',
  '1.6 s',
  '1.3 s',
  '1 s',
  '0.8 s',
  '0.6 s',
  '0.5 s',
  '0.4 s',
  '0.3 s',
  '1/4 s',
  '1/5 s',
  '1/6 s',
  '1/8 s',
  '1/10 s',
  '1/13 s',
  '1/15 s',
  '1/20 s',
  '1/25 s',
  '1/30 s',
  '1/40 s',
  '1/50 s',
  '1/60 s',
  '1/80 s',
  '1/100 s',
  '1/125 s',
  '1/160 s',
  '1/200 s',
  '1/250 s',
  '1/320 s',
  '1/400 s',
  '1/500 s',
  '1/640 s',
  '1/800 s',
  '1/1000 s',
  '1/1250 s',
  '1/1600 s',
  '1/2000 s',
  '1/2500 s',
  '1/3200 s',
  '1/4000 s',
  '1/5000 s',
  '1/6000 s',
  '1/8000 s',
];
