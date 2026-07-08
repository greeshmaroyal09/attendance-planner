import { describe, expect, it } from 'vitest';
import { buildSubjectSummary, clearAttendanceForDate } from './attendanceService';
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

  it('removes a saved attendance entry for a selected date', () => {
    const attendanceRecords = {
      '2026-07-06': { OS: 'present' },
      '2026-07-07': { DL: 'absent' },
    };

    const nextRecords = clearAttendanceForDate(attendanceRecords, '2026-07-06');

    expect(nextRecords['2026-07-06']).toBeUndefined();
    expect(nextRecords['2026-07-07']).toEqual({ DL: 'absent' });
  });

  it('does not count holidays or exam days toward remaining classes', () => {
    const calendar = {
      ...academicCalendar,
      holidays: ['2026-07-08'],
      midExams: ['2026-07-09'],
      endExams: [],
      lastWorkingDay: '2026-07-10',
    };

    const summary = buildSubjectSummary(
      [{ id: '1', name: 'OS' }],
      {},
      '2026-07-07',
      { Wednesday: ['OS'], Thursday: ['OS'], Friday: ['OS'] },
      calendar,
    );

    expect(summary[0].remaining).toBe(1);
  });
});
