import { describe, expect, it } from 'vitest';
import { getDateRangeBounds } from '../src/services/financeService.js';

describe('Finance & Date Range Bounds Calculations', () => {
  it('calculates correct start and end date for "today"', () => {
    const { startDate, endDate } = getDateRangeBounds('today');
    const start = new Date(startDate);
    const end = new Date(endDate);

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it('calculates correct start date for "this_month"', () => {
    const { startDate } = getDateRangeBounds('this_month');
    const start = new Date(startDate);
    expect(start.getDate()).toBe(1);
  });

  it('calculates custom date range correctly', () => {
    const startInput = '2026-01-01T00:00:00.000Z';
    const endInput = '2026-01-31T23:59:59.999Z';
    const { startDate, endDate } = getDateRangeBounds('custom', startInput, endInput);

    expect(startDate).toBe(startInput);
    expect(endDate).toBe(endInput);
  });
});
