import { describe, expect, it } from 'vitest';
import { getTomorrowSubjectNames, hasSavedAttendanceForDate, shouldSendReminder } from './reminders';

describe('reminder helpers', () => {
  it('detects whether attendance has been saved for a date', () => {
    expect(hasSavedAttendanceForDate({ '2026-09-19': { P1: 'present' } }, '2026-09-19')).toBe(true);
    expect(hasSavedAttendanceForDate({ '2026-09-19': {} }, '2026-09-19')).toBe(false);
    expect(hasSavedAttendanceForDate({}, '2026-09-19')).toBe(false);
  });

  it('gets tomorrow classes from the current timetable data', () => {
    const timetable = { Monday: ['DBMS', 'Machine Learning'], Tuesday: ['OS'] };
    const subjects = [{ id: '1', name: 'DBMS' }, { id: '2', name: 'Machine Learning' }, { id: '3', name: 'OS' }];

    const tomorrow = new Date('2026-09-20T12:00:00Z');
    const names = getTomorrowSubjectNames({ timetable, subjects, referenceDate: tomorrow });

    expect(names).toEqual(['DBMS', 'Machine Learning']);
  });

  it('skips reminders when toggles are off or there is no class tomorrow', () => {
    const noClasses = { Monday: [] };
    const nextDay = new Date('2026-09-21T12:00:00Z');

    expect(shouldSendReminder({ enabled: false, type: 'attendance', dateKey: '2026-09-19', reminderKey: 'attendance-2026-09-19' })).toBe(false);
    expect(shouldSendReminder({ enabled: true, type: 'tomorrowClasses', dateKey: '2026-09-20', reminderKey: 'tomorrow-2026-09-20', subjectNames: [] })).toBe(false);
    expect(shouldSendReminder({ enabled: true, type: 'tomorrowClasses', dateKey: '2026-09-20', reminderKey: 'tomorrow-2026-09-20', subjectNames: ['DBMS'] })).toBe(true);
    expect(getTomorrowSubjectNames({ timetable: noClasses, subjects: [{ id: '1', name: 'DBMS' }], referenceDate: nextDay })).toEqual([]);
  });
});
