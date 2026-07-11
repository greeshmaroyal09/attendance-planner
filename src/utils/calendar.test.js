import { describe, expect, it } from 'vitest';

describe('getDayName', () => {
  it('maps ISO dates to the correct weekday in non-UTC time zones', async () => {
    process.env.TZ = 'America/Los_Angeles';
    const { getDayName } = await import('./calendar.js');

    expect(getDayName('2026-07-08')).toBe('Wednesday');
  });
});

describe('isWorkingDay', () => {
  it('treats custom holidays as non-working days', async () => {
    const { isWorkingDay } = await import('./calendar.js');
    const calendar = {
      startDate: '2026-07-06',
      lastWorkingDay: '2026-07-10',
      holidays: [],
      poojaHolidays: [],
      deepavaliHolidays: [],
      midExams: [],
      endExams: [],
      customHolidays: ['2026-07-08'],
    };

    expect(isWorkingDay('2026-07-08', calendar)).toBe(false);
  });
});
