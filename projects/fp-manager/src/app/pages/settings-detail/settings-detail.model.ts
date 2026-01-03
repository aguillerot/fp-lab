import {
  AeMeteringMode,
  Aperture,
  DriveMode,
  IsoSensitivity,
  IsoSensitivityWithoutAuto,
  IsoStep,
  ShootingMode,
  ShutterSpeed,
  WhiteBalanceMode,
} from 'fp-shared/models';

export type SettingsFormData = {
  iso: {
    sensitivity: IsoSensitivity;
    lowExpansion: boolean;
    highExpansion: boolean;
    autoLowerLimit: IsoSensitivityWithoutAuto;
    autoUpperLimit: IsoSensitivityWithoutAuto;
    sensitivityStep: IsoStep;
  };
  exposure: {
    name: string;
    icon: string;
    shootingMode: ShootingMode;
    compensation: number;
    aeMeteringMode: AeMeteringMode;
    aperture: Aperture;
    shutterSpeed: ShutterSpeed;
  };
  drive: {
    mode: DriveMode;
    intervalTimerTimes: number | 'Infinity';
    intervalTimerDuration: number;
  };
  whiteBalance: {
    mode: WhiteBalanceMode;
    shiftBA: number;
    shiftMG: number;
  };
};

export const getDefaultSettingsFormData = (): SettingsFormData => ({
  iso: {
    sensitivity: 100,
    lowExpansion: false,
    highExpansion: false,
    autoLowerLimit: 100,
    autoUpperLimit: 3200,
    sensitivityStep: '1 EV',
  },
  exposure: {
    aperture: 'f/2.8',
    shutterSpeed: '1/125 s',
    name: 'Default',
    icon: 'C1',
    shootingMode: 'M',
    compensation: 0,
    aeMeteringMode: 'Evaluative Metering',
  },
  drive: {
    mode: 'Single capture',
    intervalTimerTimes: 2,
    intervalTimerDuration: 30,
  },
  whiteBalance: {
    mode: 'Auto',
    shiftBA: 0,
    shiftMG: 0,
  },
});

export type ExposureSettingsFormData = SettingsFormData['exposure'];
export type IsoSettingsFormData = SettingsFormData['iso'];
export type DriveSettingsFormData = SettingsFormData['drive'];
export type WhiteBalanceSettingsFormData = SettingsFormData['whiteBalance'];
