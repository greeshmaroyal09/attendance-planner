import { describe, expect, it } from 'vitest';

describe('getDayName', () => {
  it('maps ISO dates to the correct weekday in non-UTC time zones', async () => {
    process.env.TZ = 'America/Los_Angeles';
    const { getDayName } = await import('./calendar.js');

    expect(getDayName('2026-07-08')).toBe('Wednesday');
  });
});
