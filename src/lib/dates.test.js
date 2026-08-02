import { describe, expect, it } from 'vitest';

import { addDays, daysBetween, formatDate, toISODate } from './dates';

describe('toISODate', () => {
  it('formats in local time, not UTC', () => {
    // 01:30 local on 15 March. toISOString() would report 14 March in
    // Romania, which is exactly the off-by-one that made same-day bookings
    // look like they were in the past.
    expect(toISODate(new Date(2026, 2, 15, 1, 30))).toBe('2026-03-15');
  });

  it('pads single-digit months and days', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  it('advances by whole days', () => {
    expect(addDays('2026-03-15', 1)).toBe('2026-03-16');
  });

  it('rolls over month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('rolls over leap years', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('daysBetween', () => {
  it('counts whole days', () => {
    expect(daysBetween('2026-03-15', '2026-03-22')).toBe(7);
  });

  it('returns 0 for reversed or equal dates', () => {
    expect(daysBetween('2026-03-22', '2026-03-15')).toBe(0);
    expect(daysBetween('2026-03-15', '2026-03-15')).toBe(0);
  });

  it('returns 0 when a date is missing or unparseable', () => {
    expect(daysBetween('', '2026-03-22')).toBe(0);
    expect(daysBetween('not-a-date', '2026-03-22')).toBe(0);
  });

  it('is unaffected by daylight saving transitions', () => {
    // Romania moves the clocks forward on 29 March 2026; a naive
    // millisecond division would return 6.958 days and floor to 6.
    expect(daysBetween('2026-03-26', '2026-04-02')).toBe(7);
  });
});

describe('formatDate', () => {
  it('renders an em dash for empty input', () => {
    expect(formatDate('')).toBe('—');
  });

  it('returns the raw value when it cannot be parsed', () => {
    expect(formatDate('nope')).toBe('nope');
  });
});
