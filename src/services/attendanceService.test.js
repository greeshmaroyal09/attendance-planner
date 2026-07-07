import { describe, expect, it } from 'vitest';
import { buildSubjectSummary } from './attendanceService';
import { academicCalendar } from '../data/academicCalendar';
import { getDayName, isWorkingDay } from '../utils/calendar';

describe('buildSubjectSummary', () => {
  it('counts future subject occurrences from the selected date onward using the timetable', () => {
    const subjects = [
      { id: '1', name: 'OS' },
      { id: '2', name: 'DL' },
      { id: '3', name: 'CN' },
    ];

    const timetable = {
      Monday: ['OS'],
      Tuesday: ['DL'],
      Wednesday: ['OS', 'DL'],
      Thursday: ['CN'],
      Friday: ['OS'],
    };

    const summary = buildSubjectSummary(
      subjects,
      {},
      '2026-07-08',
      timetable,
      academicCalendar,
    );

    const os = summary.find((item) => item.name === 'OS');
    const dl = summary.find((item) => item.name === 'DL');
    const cn = summary.find((item) => item.name === 'CN');

    const expectedOccurrences = (subjectName) => {
      let count = 0;
      let current = new Date('2026-07-09T00:00:00Z');
      const end = new Date(`${academicCalendar.lastWorkingDay}T00:00:00Z`);

      while (current <= end) {
        const isoDate = current.toISOString().split('T')[0];
        if (isWorkingDay(isoDate, academicCalendar)) {
          const dayName = getDayName(isoDate);
          count += (timetable[dayName] || []).filter((entry) => entry === subjectName).length;
        }
        current.setDate(current.getDate() + 1);
      }

      return count;
    };

    expect(os.remaining).toBe(expectedOccurrences('OS'));
    expect(dl.remaining).toBe(expectedOccurrences('DL'));
    expect(cn.remaining).toBe(expectedOccurrences('CN'));
  });
});
