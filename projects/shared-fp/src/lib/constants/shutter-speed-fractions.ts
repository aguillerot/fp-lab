import { Fraction } from 'fraction.js';
import { ShutterSpeed } from '../models/shutter-speed.model';

/**
 * Mapping of ShutterSpeed display values to their exact fractional values.
 * Most are parsed directly, but some have specific definitions in the camera.
 */
export const SHUTTER_SPEED_FRACTIONS: Record<ShutterSpeed, Fraction> = {
  '30 s': new Fraction(30),
  '25 s': new Fraction(25),
  '20 s': new Fraction(20),
  '15 s': new Fraction(15),
  '13 s': new Fraction(13),
  '10 s': new Fraction(10),
  '8 s': new Fraction(8),
  '6 s': new Fraction(6),
  '5 s': new Fraction(5),
  '4 s': new Fraction(4),
  '3.2 s': new Fraction(32, 10),
  '2.5 s': new Fraction(25, 10),
  '2 s': new Fraction(2),
  '1.6 s': new Fraction(5, 3), // 1.666...
  '1.3 s': new Fraction(4, 3), // 1.333...
  '1 s': new Fraction(1),
  '0.8 s': new Fraction(4, 5), // 1/1.25
  '0.6 s': new Fraction(2, 3), // 1/1.5
  '0.5 s': new Fraction(1, 2),
  '0.4 s': new Fraction(2, 5), // 1/2.5
  '0.3 s': new Fraction(1, 3), // 1/3
  '1/4 s': new Fraction(1, 4),
  '1/5 s': new Fraction(1, 5),
  '1/6 s': new Fraction(1, 6),
  '1/8 s': new Fraction(1, 8),
  '1/10 s': new Fraction(1, 10),
  '1/13 s': new Fraction(1, 13),
  '1/15 s': new Fraction(1, 15),
  '1/20 s': new Fraction(1, 20),
  '1/25 s': new Fraction(1, 25),
  '1/30 s': new Fraction(1, 30),
  '1/40 s': new Fraction(1, 40),
  '1/50 s': new Fraction(1, 50),
  '1/60 s': new Fraction(1, 60),
  '1/80 s': new Fraction(1, 80),
  '1/100 s': new Fraction(1, 100),
  '1/125 s': new Fraction(1, 125),
  '1/160 s': new Fraction(1, 160),
  '1/200 s': new Fraction(1, 200),
  '1/250 s': new Fraction(1, 250),
  '1/320 s': new Fraction(1, 320),
  '1/400 s': new Fraction(1, 400),
  '1/500 s': new Fraction(1, 500),
  '1/640 s': new Fraction(1, 640),
  '1/800 s': new Fraction(1, 800),
  '1/1000 s': new Fraction(1, 1000),
  '1/1250 s': new Fraction(1, 1250),
  '1/1600 s': new Fraction(1, 1600),
  '1/2000 s': new Fraction(1, 2000),
  '1/2500 s': new Fraction(1, 2500),
  '1/3200 s': new Fraction(1, 3200),
  '1/4000 s': new Fraction(1, 4000),
  '1/5000 s': new Fraction(1, 5000),
  '1/6000 s': new Fraction(1, 6000),
  '1/8000 s': new Fraction(1, 8000),
};
