import { describe, expect, it } from 'vitest';
import { buildLeavePrediction, buildSubjectSummary, clearAttendanceForDate, normalizeAttendanceRecords } from './attendanceService';
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

  it('counts each repeated subject slot as a separate class for the same day', () => {
    const subjects = [{ id: '1', name: 'OS' }];
    const timetable = { Monday: ['OS', 'OS'] };

    const summary = buildSubjectSummary(subjects, { '2026-07-06': { OS: 'present' } }, '2026-07-07', timetable, academicCalendar);

    expect(summary[0]).toMatchObject({ attended: 2, conducted: 2, percentage: 100 });
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

  it('uses special working-day timetable rules and no-class rules when counting future classes', () => {
    const calendar = {
      ...academicCalendar,
      lastWorkingDay: '2026-07-12',
      dateRules: {
        '2026-07-11': { status: 'working', specialWorkingDaySource: 'Monday' },
        '2026-07-12': { status: 'no-class' },
      },
    };

    const summary = buildSubjectSummary(
      [{ id: '1', name: 'OS' }],
      {},
      '2026-07-09',
      { Monday: ['OS'], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] },
      calendar,
    );

    expect(summary[0].remaining).toBe(1);
  });

  it('respects half-day period disablement when counting future classes', () => {
    const calendar = {
      ...academicCalendar,
      lastWorkingDay: '2026-07-13',
      dateRules: {
        '2026-07-13': { status: 'half-day', disabledPeriods: ['P2'] },
      },
    };

    const summary = buildSubjectSummary(
      [{ id: '1', name: 'OS' }, { id: '2', name: 'Math' }],
      {},
      '2026-07-10',
      { Monday: ['OS', 'Math'] },
      calendar,
    );

    expect(summary[0].remaining).toBe(1);
    expect(summary[1].remaining).toBe(0);
  });

  it('uses existing attendance as the baseline for leave predictions', () => {
    const subjects = [{ id: '1', name: 'OS' }];
    const attendanceRecords = {
      '2026-07-06': { OS: 'present' },
      '2026-07-07': { OS: 'absent' },
      '2026-07-08': { OS: 'present' },
    };

    const rows = buildLeavePrediction(
      subjects,
      attendanceRecords,
      '2026-07-09',
      '2026-07-10',
      { Monday: ['OS'], Tuesday: ['OS'], Thursday: ['OS'], Friday: ['OS'] },
      academicCalendar,
      75,
    );

    expect(rows[0]).toMatchObject({
      currentConducted: 3,
      currentPresent: 2,
      currentPercentage: 66.67,
      futureMissed: 2,
      predictedConducted: 5,
      predictedPresent: 2,
      predictedPercentage: 40,
      status: 'Danger',
    });
  });

  it('removes attendance entries that no longer match the current timetable or subjects', () => {
    const subjects = [
      { id: '1', name: 'OS' },
      { id: '2', name: 'DBMS' },
    ];

    const timetable = {
      Monday: ['OS'],
      Tuesday: ['DBMS'],
    };

    const normalized = normalizeAttendanceRecords(
      {
        '2026-07-06': { OS: 'present', DL: 'absent', 'legacy-slot': 'present' },
        '2026-07-07': { DBMS: 'present', CN: 'absent' },
      },
      subjects,
      timetable,
      academicCalendar,
    );

    expect(normalized['2026-07-06']).toEqual({ OS: 'present' });
    expect(normalized['2026-07-07']).toEqual({ DBMS: 'present' });
  });
});
