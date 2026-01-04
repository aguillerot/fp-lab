import { Aperture } from 'fp-shared/models';
import { AeMeteringMode, ShootingMode } from '../models/camera-settings.model';

/**
 * Exposure-related constants following photography standards.
 *
 * Key concepts:
 * - 1 stop = doubling/halving of light
 * - Modern cameras use 1/3 stop increments
 * - APEX system: EV = Av + Tv - Sv (Aperture + Time - Sensitivity values)
 */

// ============================================================================
// Aperture (f-stop) Constants
// ============================================================================

/**
 * Standard aperture values in 1/3 stop increments.
 * Formula: f_n = 2^(n/6) where n is the 1/3 stop index from f/1.0
 *
 * Full stops (bold): f/1.0 → **f/1.4** → f/2.0 → **f/2.8** → f/4.0 → **f/5.6** → f/8.0...
 */
export const standardApertureOptions: Aperture[] = [
  'f/1.0',
  'f/1.1',
  'f/1.2',
  'f/1.4',
  'f/1.6',
  'f/1.8',
  'f/2.0',
  'f/2.2',
  'f/2.5',
  'f/2.8',
  'f/3.2',
  'f/3.5',
  'f/4.0',
  'f/4.5',
  'f/5.0',
  'f/5.6',
  'f/6.3',
  'f/7.1',
  'f/8.0',
  'f/9.0',
  'f/10',
  'f/11',
  'f/13',
  'f/14',
  'f/16',
  'f/18',
  'f/20',
  'f/22',
];

// ============================================================================
// Exposure Compensation Constants
// ============================================================================

/**
 * Exposure compensation values in 1/3 stop increments.
 * Range: -5 EV to +5 EV
 */
export const exposureCompensationOptions: number[] = [
  -5.0, -4.7, -4.3, -4.0, -3.7, -3.3, -3.0, -2.7, -2.3, -2.0, -1.7, -1.3, -1.0, -0.7, -0.3, 0.0, 0.3, 0.7, 1.0, 1.3,
  1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 4.3, 4.7, 5.0,
];

/**
 * Formats exposure compensation for display.
 * Positive values show "+", zero shows "±0"
 */
export function formatExposureCompensation(ev: number): string {
  if (ev === 0) return '±0 EV';
  const sign = ev > 0 ? '+' : '';
  return `${sign}${ev.toFixed(1)} EV`;
}

// ============================================================================
// AE Metering and Shooting Mode Constants
// ============================================================================

export const aeMeteringModeOptions: AeMeteringMode[] = [
  'Evaluative Metering',
  'Center Weighted Average Metering',
  'Spot Metering',
];

export const shootingModeOptions: ShootingMode[] = ['M', 'S', 'A', 'P'];
