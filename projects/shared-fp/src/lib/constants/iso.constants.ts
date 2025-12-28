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
