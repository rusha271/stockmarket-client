/**
 * 5-minute time slot utilities for Indian market (IST).
 * Market hours: 9:15–15:30 IST. Slots: 9:15, 9:20, …, 15:25, 15:30.
 * - currentSlot: last completed 5-min candle (e.g. 14:35 when it's 14:38)
 * - predictionTargetSlot: next 5-min candle (e.g. 14:40)
 */

const FIVE_MIN_MS = 5 * 60 * 1000;

/** Get current time in IST as { hours, minutes } (24hr) */
function getISTNow(): { hours: number; minutes: number } {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const hours = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minutes = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { hours, minutes };
}

/** Floor minutes to 5-min boundary (0, 5, 10, …, 55) */
function floorToFiveMinutes(minutes: number): number {
  return Math.floor(minutes / 5) * 5;
}

export interface FiveMinSlot {
  /** Last completed 5-min slot, e.g. "14:35" */
  currentSlot: string;
  /** Next 5-min slot (prediction target), e.g. "14:40" */
  predictionTargetSlot: string;
  /** Display string e.g. "2:35" (12hr) or "14:35" */
  currentSlotDisplay: string;
  /** Display string e.g. "2:40" (12hr) or "14:40" */
  predictionTargetDisplay: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Get current and prediction target 5-min slots in IST.
 * If it's 14:38 → currentSlot 14:35, predictionTargetSlot 14:40.
 */
export function getFiveMinSlots(): FiveMinSlot {
  const { hours, minutes } = getISTNow();
  const flooredMins = floorToFiveMinutes(minutes);
  const targetMins = flooredMins + 5;

  if (targetMins >= 60) {
    const nextH = hours + 1;
    const nextM = targetMins - 60;
    return {
      currentSlot: `${pad2(hours)}:${pad2(flooredMins)}`,
      predictionTargetSlot: `${pad2(nextH)}:${pad2(nextM)}`,
      currentSlotDisplay: `${hours}:${pad2(flooredMins)}`,
      predictionTargetDisplay: `${nextH}:${pad2(nextM)}`,
    };
  }

  return {
    currentSlot: `${pad2(hours)}:${pad2(flooredMins)}`,
    predictionTargetSlot: `${pad2(hours)}:${pad2(targetMins)}`,
    currentSlotDisplay: `${hours}:${pad2(flooredMins)}`,
    predictionTargetDisplay: `${hours}:${pad2(targetMins)}`,
  };
}

/**
 * Milliseconds until the next 5-min boundary in IST.
 * Used for aligning auto-refresh to 14:40, 14:45, 14:50, etc.
 */
export function getMsUntilNextFiveMinBoundary(): number {
  const now = new Date();
  const utcMs = now.getTime();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istMs = utcMs + istOffsetMs;
  const dayMs = 24 * 60 * 60 * 1000;
  const msSinceMidnight = istMs % dayMs;
  const currentSlotStart = Math.floor(msSinceMidnight / FIVE_MIN_MS) * FIVE_MIN_MS;
  const nextSlotStart = currentSlotStart + FIVE_MIN_MS;
  const msUntilNext = nextSlotStart - msSinceMidnight;
  return msUntilNext > 0 ? msUntilNext : FIVE_MIN_MS;
}

/** NSE market hours: 9:15–15:30 IST on weekdays */
const MARKET_OPEN_MINS = 9 * 60 + 15; // 9:15
const MARKET_CLOSE_MINS = 15 * 60 + 30; // 15:30

function isWeekendIST(): boolean {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  });
  const day = formatter.format(new Date());
  return day === 'Sat' || day === 'Sun';
}

/**
 * Returns true if NSE market is open (9:15–15:30 IST, weekdays).
 * Stops API calls when market is closed.
 */
export function isMarketOpen(): boolean {
  if (isWeekendIST()) return false;
  const { hours, minutes } = getISTNow();
  const totalMins = hours * 60 + minutes;
  return totalMins >= MARKET_OPEN_MINS && totalMins <= MARKET_CLOSE_MINS;
}
