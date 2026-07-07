import { describe, expect, it } from 'vitest';
import { buildPeriodSlots } from './timetable.js';

describe('buildPeriodSlots', () => {
  it('preserves timetable order and marks empty periods without buttons', () => {
    const slots = buildPeriodSlots(['OS', '', 'DL', 'DAA']);

    expect(slots).toEqual([
      { period: 'P1', subjectName: 'OS', isEmpty: false },
      { period: 'P2', subjectName: '', isEmpty: true },
      { period: 'P3', subjectName: 'DL', isEmpty: false },
      { period: 'P4', subjectName: 'DAA', isEmpty: false },
    ]);
  });
});
