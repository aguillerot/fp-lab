import { Injectable } from '@angular/core';
import { decodeAeMeteringMode, encodeAeMeteringMode } from '../decoders/ae-metering-mode';
import { decodeAutoIsoLowerLimit, encodeAutoIsoLowerLimit } from '../decoders/auto-iso-lower-limit';
import {
  decodeAutoIsoSlowestShutterLimit,
  encodeAutoIsoSlowestShutterLimit,
} from '../decoders/auto-iso-slowest-shutter-limit';
import {
  decodeAutoIsoSlowestShutterMode,
  encodeAutoIsoSlowestShutterMode,
} from '../decoders/auto-iso-slowest-shutter-mode';
import { decodeAutoIsoUpperLimit, encodeAutoIsoUpperLimit } from '../decoders/auto-iso-upper-limit';
import { decodeDriveMode, encodeDriveMode } from '../decoders/drive-mode';
import { decodeExposureCompensation, encodeExposureCompensation } from '../decoders/exposure-compensation';
import { decodeIntervalTimerDuration, encodeIntervalTimerDuration } from '../decoders/interval-timer-duration';
import { decodeIntervalTimerTimes, encodeIntervalTimerTimes } from '../decoders/interval-timer-times';
import { decodeIsoConfiguration, encodeIsoConfiguration } from '../decoders/iso-configuration';
import { decodeIsoMode, encodeIsoMode } from '../decoders/iso-mode';
import { decodeIsoSensitivity, encodeIsoSensitivity } from '../decoders/iso-sensitivity';
import { decodeShootingMode, encodeShootingMode } from '../decoders/shooting-mode';
import { decodeShootingModeIcon, encodeShootingModeIcon } from '../decoders/shooting-mode-icon';
import { decodeShootingModeName, encodeShootingModeName } from '../decoders/shooting-mode-name';
import { decodeWhiteBalanceMode, encodeWhiteBalanceMode } from '../decoders/white-balance-mode';
import { decodeWhiteBalanceShiftBA, encodeWhiteBalanceShiftBA } from '../decoders/white-balance-shift-ba';
import { decodeWhiteBalanceShiftMG, encodeWhiteBalanceShiftMG } from '../decoders/white-balance-shift-mg';
import { CameraSettings } from '../models/camera-settings.model';

@Injectable({
  providedIn: 'root',
})
export class CameraProtocolService {
  /**
   * Decodes a Uint8Array from a QR code scan into CameraSettings.
   * @param data The raw byte data from the QR code.
   * @returns The decoded camera settings.
   */
  decode(data: Uint8Array): CameraSettings {
    // TODO: Implement actual decoding logic based on the Sigma fp protocol
    // This is a skeleton implementation

    if (!data || data.length === 0) {
      throw new Error('Invalid data: Empty buffer');
    }

    // Example decoding logic (placeholder)
    const settings: CameraSettings = {
      isoMode: decodeIsoMode(data),
      shootingModeName: decodeShootingModeName(data),
      shootingModeIcon: decodeShootingModeIcon(data),
      shootingMode: decodeShootingMode(data),
      isoSensitivity: decodeIsoSensitivity(data),
      exposureCompensation: decodeExposureCompensation(data),
      ...decodeIsoConfiguration(data),
      autoIsoLowerLimit: decodeAutoIsoLowerLimit(data),
      autoIsoUpperLimit: decodeAutoIsoUpperLimit(data),
      autoIsoSlowestShutterMode: decodeAutoIsoSlowestShutterMode(data),
      autoIsoSlowestShutterLimit: decodeAutoIsoSlowestShutterLimit(data),
      aeMeteringMode: decodeAeMeteringMode(data),
      driveMode: decodeDriveMode(data),
      intervalTimerTimes: decodeIntervalTimerTimes(data),
      intervalTimerDuration: decodeIntervalTimerDuration(data),
      whiteBalanceMode: decodeWhiteBalanceMode(data),
      whiteBalanceShiftBA: decodeWhiteBalanceShiftBA(data),
      whiteBalanceShiftMG: decodeWhiteBalanceShiftMG(data),
    } as CameraSettings;

    // ... read bytes from data and populate settings ...
    // e.g. settings.isoMode = data[0] === 1 ? IsoMode.Manual : IsoMode.Auto;

    return settings;
  }

  /**
   * Encodes CameraSettings into a Uint8Array for QR code generation.
   * @param settings The camera settings to encode.
   * @returns The raw byte data.
   */
  encode(data: Uint8Array, settings: CameraSettings): Uint8Array {
    encodeExposureCompensation(settings.exposureCompensation, data);
    encodeShootingModeName(settings.shootingModeName, data);
    encodeShootingModeIcon(settings.shootingModeIcon, data);
    encodeShootingMode(settings.shootingMode, data);
    encodeIsoMode(settings.isoMode, data);
    encodeIsoSensitivity(settings.isoSensitivity, data);
    encodeIsoConfiguration(settings, data);
    encodeAutoIsoLowerLimit(settings.autoIsoLowerLimit, data);
    encodeAutoIsoUpperLimit(settings.autoIsoUpperLimit, data);
    encodeAutoIsoSlowestShutterMode(settings.autoIsoSlowestShutterMode, data);
    encodeAutoIsoSlowestShutterLimit(settings.autoIsoSlowestShutterLimit, data);
    encodeAeMeteringMode(settings.aeMeteringMode, data);
    encodeDriveMode(settings.driveMode, data);
    encodeIntervalTimerTimes(settings.intervalTimerTimes, data);
    encodeIntervalTimerDuration(settings.intervalTimerDuration, data);
    encodeWhiteBalanceMode(settings.whiteBalanceMode, data);
    encodeWhiteBalanceShiftBA(settings.whiteBalanceShiftBA, data);
    encodeWhiteBalanceShiftMG(settings.whiteBalanceShiftMG, data);

    // ... write settings to data ...
    // e.g. data[0] = settings.isoMode === IsoMode.Manual ? 1 : 0;

    return data;
  }
}
