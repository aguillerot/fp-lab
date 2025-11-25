const INTERVAL_TIMER_DURATION_LOW_OFFSET = 141;
const INTERVAL_TIMER_DURATION_HIGH_OFFSET = 142;

export function decodeIntervalTimerDuration(data: Uint8Array): number {
  const lowByte = data[INTERVAL_TIMER_DURATION_LOW_OFFSET];
  const highByte = data[INTERVAL_TIMER_DURATION_HIGH_OFFSET];

  // Calculate values based on offsets and handle wrapping for low byte
  const highVal = highByte - INTERVAL_TIMER_DURATION_HIGH_OFFSET;
  const lowVal = (lowByte - INTERVAL_TIMER_DURATION_LOW_OFFSET + 256) % 256;

  const totalSeconds = highVal * 256 + lowVal;
  return totalSeconds;
}

export function encodeIntervalTimerDuration(seconds: number, data: Uint8Array): void {
  const highVal = Math.floor(seconds / 256);
  const lowVal = seconds % 256;

  data[INTERVAL_TIMER_DURATION_HIGH_OFFSET] = INTERVAL_TIMER_DURATION_HIGH_OFFSET + highVal;
  data[INTERVAL_TIMER_DURATION_LOW_OFFSET] = (INTERVAL_TIMER_DURATION_LOW_OFFSET + lowVal) % 256;
}
