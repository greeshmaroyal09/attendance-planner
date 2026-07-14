import { calculateAttendance } from '../utils/attendance';
import { getDateRange, getDateSchedule, isWorkingDay } from '../utils/calendar';

function getValidSubjectNames(subjects = []) {
  return new Set((subjects || []).map((subject) => subject?.name).filter(Boolean));
}

function getDayTimetable(date, timetable = {}, calendar = null) {
  const schedule = getDateSchedule(date, timetable, calendar);
  return schedule.timetable || [];
}

function countSubjectSlots(subjectName, date, timetable = {}, calendar = null) {
  return getDayTimetable(date, timetable, calendar).filter((entry) => entry === subjectName).length;
}

function getSubjectAttendanceCounts(subjectName, record, date, timetable = {}, calendar = null, fallbackToSingle = false) {
  const slotCount = countSubjectSlots(subjectName, date, timetable, calendar);

  if (slotCount > 0) {
    if (record?.[subjectName] === 'present') {
      return { attended: slotCount, conducted: slotCount };
    }

    if (record?.[subjectName] === 'absent') {
      return { attended: 0, conducted: slotCount };
    }
  }

  if (!fallbackToSingle) {
    return { attended: 0, conducted: 0 };
  }

  if (record?.[subjectName] === 'present') {
    return { attended: 1, conducted: 1 };
  }

  if (record?.[subjectName] === 'absent') {
    return { attended: 0, conducted: 1 };
  }

  return { attended: 0, conducted: 0 };
}

export function normalizeAttendanceRecords(attendanceRecords = {}, subjects = [], timetable = {}, calendar = null) {
  const nextRecords = {};
  const validSubjects = getValidSubjectNames(subjects);

  Object.entries(attendanceRecords || {}).forEach(([date, record]) => {
    if (!date || !record || typeof record !== 'object' || Array.isArray(record)) {
      return;
    }

    const activeSubjects = new Set(getDayTimetable(date, timetable, calendar).filter((entry) => validSubjects.has(entry)));
    const normalizedRecord = Object.entries(record).reduce((acc, [subjectName, status]) => {
      if (!subjectName || !validSubjects.has(subjectName)) {
        return acc;
      }

      if (!activeSubjects.has(subjectName)) {
        return acc;
      }

      if (status === 'present' || status === 'absent') {
        acc[subjectName] = status;
      }

      return acc;
    }, {});

    if (Object.keys(normalizedRecord).length) {
      nextRecords[date] = normalizedRecord;
    }
  });

  return nextRecords;
}

export function clearAttendanceForDate(attendanceRecords = {}, date) {
  if (!date) {
    return attendanceRecords;
  }

  const nextRecords = { ...(attendanceRecords || {}) };
  delete nextRecords[date];
  return nextRecords;
}

function countFutureOccurrences(subjectName, selectedDate, timetable = {}, calendar = null) {
  const calendarData = calendar || { lastWorkingDay: new Date().toISOString().split('T')[0] };
  return getDateRange(selectedDate, calendarData.lastWorkingDay)
    .filter((date) => date > selectedDate)
    .filter((date) => isWorkingDay(date, calendarData))
    .reduce((count, date) => {
      const dayTimetable = getDateSchedule(date, timetable, calendarData).timetable || [];
      return count + dayTimetable.filter((entry) => entry === subjectName).length;
    }, 0);
}

export function buildSubjectSummary(subjects, attendanceRecords, selectedDate = new Date().toISOString().split('T')[0], timetable = {}, calendar = null) {
  const normalizedRecords = normalizeAttendanceRecords(attendanceRecords, subjects, timetable, calendar);

  const summary = (subjects || []).map((subject) => {
    let attended = 0;
    let conducted = 0;

    Object.entries(normalizedRecords || {}).forEach(([date, record]) => {
      const counts = getSubjectAttendanceCounts(subject.name, record, date, timetable, calendar, false);
      attended += counts.attended;
      conducted += counts.conducted;
    });

    const futureOccurrences = countFutureOccurrences(subject.name, selectedDate, timetable, calendar);

    return {
      id: subject.id,
      name: subject.name,
      attended,
      conducted,
      percentage: calculateAttendance(attended, conducted),
      remaining: Math.max(0, futureOccurrences),
    };
  });

  return summary;
}

export function buildLeavePrediction(subjects, attendanceRecords, startDate, endDate, timetable = {}, calendar = null, threshold = 75) {
  const today = new Date().toISOString().split('T')[0];

  return (subjects || []).map((subject) => {
    let currentPresent = 0;
    let currentConducted = 0;

    Object.entries(attendanceRecords || {}).forEach(([date, record]) => {
      if (!date || !record || typeof record !== 'object' || Array.isArray(record)) {
        return;
      }

      if (date > today || (startDate && date >= startDate)) {
        return;
      }

      const counts = getSubjectAttendanceCounts(subject.name, record, date, timetable, calendar, true);
      currentPresent += counts.attended;
      currentConducted += counts.conducted;
    });

    let futureMissed = 0;
    if (startDate && endDate && startDate <= endDate) {
      futureMissed = getDateRange(startDate, endDate)
        .filter((date) => isWorkingDay(date, calendar))
        .reduce((count, date) => {
          const dayTimetable = getDateSchedule(date, timetable, calendar).timetable || [];
          return count + dayTimetable.filter((entry) => entry === subject.name).length;
        }, 0);
    }

    const predictedConducted = currentConducted + futureMissed;
    const predictedPresent = currentPresent;
    const predictedPercentage = calculateAttendance(predictedPresent, predictedConducted);
    const status = predictedPercentage >= threshold ? 'Safe' : predictedPercentage >= threshold - 5 ? 'Warning' : 'Danger';

    return {
      id: subject.id,
      name: subject.name,
      currentConducted,
      currentPresent,
      currentPercentage: calculateAttendance(currentPresent, currentConducted),
      futureMissed,
      predictedConducted,
      predictedPresent,
      predictedPercentage,
      status,
    };
  });
}

export function getOverallAttendance(summary) {
  const totalAttended = summary.reduce((sum, item) => sum + item.attended, 0);
  const totalConducted = summary.reduce((sum, item) => sum + item.conducted, 0);
  return calculateAttendance(totalAttended, totalConducted);
}
