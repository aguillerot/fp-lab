/**
 * Aperture (f-stop) type representing standard 1/3 stop values.
 *
 * The f-stop scale follows powers of √2 (≈ 1.414):
 * - Full stops: f/1.0 → f/1.4 → f/2.0 → f/2.8 → f/4.0 → f/5.6 → f/8.0...
 * - Formula: f_n = 2^(n/6) where n is the 1/3 stop index
 */
export type Aperture =
  | 'f/1.0'
  | 'f/1.1'
  | 'f/1.2'
  | 'f/1.4'
  | 'f/1.6'
  | 'f/1.8'
  | 'f/2.0'
  | 'f/2.2'
  | 'f/2.5'
  | 'f/2.8'
  | 'f/3.2'
  | 'f/3.5'
  | 'f/4.0'
  | 'f/4.5'
  | 'f/5.0'
  | 'f/5.6'
  | 'f/6.3'
  | 'f/7.1'
  | 'f/8.0'
  | 'f/9.0'
  | 'f/10'
  | 'f/11'
  | 'f/13'
  | 'f/14'
  | 'f/16'
  | 'f/18'
  | 'f/20'
  | 'f/22';
