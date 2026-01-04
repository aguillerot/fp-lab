import { describe, expect, it } from 'vitest';
import { ShutterSpeed } from '../models/shutter-speed.model';
import { decodeShutterSpeed, encodeShutterSpeed } from './shutter-speed';

describe('Shutter Speed Decoder/Encoder', () => {
  // Test data from QR code analysis: [speed, byte111 (hex), byte112 (hex)]
  const testCases: [ShutterSpeed, number, number][] = [
    ['30 s', 0x87, 0x6b],
    ['25 s', 0xca, 0x6b],
    ['20 s', 0x1c, 0x6b],
    ['15 s', 0x87, 0x6c],
    ['13 s', 0xbb, 0x6c],
    ['10 s', 0x1c, 0x6c],
    ['8 s', 0x6f, 0x6d],
    ['6 s', 0xd9, 0x6d],
    ['5 s', 0x1c, 0x6d],
    ['4 s', 0x6f, 0x6e],
    ['3.2 s', 0xc1, 0x6e],
    ['2.5 s', 0x1c, 0x6e],
    ['2 s', 0x6f, 0x6f],
    ['1.6 s', 0xb2, 0x6f],
    ['1.3 s', 0x05, 0x6f],
    ['1 s', 0x6f, 0x70],
    ['0.8 s', 0xc1, 0x70],
    ['0.6 s', 0x04, 0x70],
    ['0.5 s', 0x6f, 0x71],
    ['0.4 s', 0xc1, 0x71],
    ['0.3 s', 0x04, 0x71],
    ['1/4 s', 0x6f, 0x72],
    ['1/5 s', 0xc1, 0x72],
    ['1/6 s', 0x04, 0x72],
    ['1/8 s', 0x6f, 0x73],
    ['1/10 s', 0xc1, 0x73],
    ['1/13 s', 0x22, 0x73],
    ['1/15 s', 0x57, 0x73],
    ['1/20 s', 0xc1, 0x74],
    ['1/25 s', 0x13, 0x74],
    ['1/30 s', 0x57, 0x74],
    ['1/320 s', 0xc1, 0x78],
    ['1/400 s', 0x13, 0x78],
    ['1/500 s', 0x66, 0x78],
    ['1/640 s', 0xc1, 0x79],
    ['1/800 s', 0x13, 0x79],
    ['1/1000 s', 0x66, 0x79],
    ['1/1250 s', 0xb8, 0x7a],
    ['1/1600 s', 0x13, 0x7a],
    ['1/2000 s', 0x66, 0x7a],
    ['1/2500 s', 0xb8, 0x7b],
    ['1/3200 s', 0x13, 0x7b],
    ['1/4000 s', 0x66, 0x7b],
    ['1/5000 s', 0xb8, 0x7c],
    ['1/6000 s', 0xfb, 0x7c],
    ['1/8000 s', 0x66, 0x7c],
  ];

  describe('decodeShutterSpeed', () => {
    it.each(testCases)('should decode %s from bytes [0x%s, 0x%s]', (expectedSpeed, byte111, byte112) => {
      const data = new Uint8Array(256);
      data[111] = byte111;
      data[112] = byte112;

      const result = decodeShutterSpeed(data);

      expect(result).toBe(expectedSpeed);
    });

    it('should return default value for buffer too short', () => {
      const data = new Uint8Array(100);

      const result = decodeShutterSpeed(data);

      expect(result).toBe('1/125 s');
    });
  });

  describe('encodeShutterSpeed', () => {
    it.each(testCases)('should encode %s to bytes [0x%s, 0x%s]', (speed, expectedByte111, expectedByte112) => {
      const data = new Uint8Array(256);

      encodeShutterSpeed(speed, data);

      expect(data[111]).toBe(expectedByte111);
      expect(data[112]).toBe(expectedByte112);
    });

    it('should not modify buffer if too short', () => {
      const data = new Uint8Array(100);
      const originalData = new Uint8Array(data);

      encodeShutterSpeed('1/125 s', data);

      expect(data).toEqual(originalData);
    });
  });

  describe('round-trip encode/decode', () => {
    it.each(testCases)('should round-trip %s correctly', speed => {
      const data = new Uint8Array(256);

      encodeShutterSpeed(speed, data);
      const decoded = decodeShutterSpeed(data);

      expect(decoded).toBe(speed);
    });
  });
});
