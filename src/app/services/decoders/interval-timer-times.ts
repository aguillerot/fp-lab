import { IntervalTimerTimes } from '../../models/camera-settings.model';

const INTERVAL_TIMER_TIMES_OFFSET = 140;

export function decodeIntervalTimerTimes(data: Uint8Array): IntervalTimerTimes {
  const value = data[INTERVAL_TIMER_TIMES_OFFSET];

  // 0x8C (140) represents Infinity
  if (value === INTERVAL_TIMER_TIMES_OFFSET) {
    return 'Infinity';
  }

  // For other values, it seems to be Offset + Number of Times
  // e.g. 2 times = 140 + 2 = 142 (0x8E)
  const times = value - INTERVAL_TIMER_TIMES_OFFSET;
  return times;
}

export function encodeIntervalTimerTimes(times: IntervalTimerTimes, data: Uint8Array): void {
  if (times === 'Infinity') {
    data[INTERVAL_TIMER_TIMES_OFFSET] = INTERVAL_TIMER_TIMES_OFFSET;
  } else {
    data[INTERVAL_TIMER_TIMES_OFFSET] = INTERVAL_TIMER_TIMES_OFFSET + (times as number);
  }
}
