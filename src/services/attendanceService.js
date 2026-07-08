import { calculateAttendance } from '../utils/attendance';
import { getDateRange, getDayName, isWorkingDay } from '../utils/calendar';

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
      const dayName = getDayName(date);
      const dayTimetable = timetable?.[dayName] || [];
      return count + dayTimetable.filter((entry) => entry === subjectName).length;
    }, 0);
}

export function buildSubjectSummary(subjects, attendanceRecords, selectedDate = new Date().toISOString().split('T')[0], timetable = {}, calendar = null) {

  const summary = (subjects || []).map((subject) => {
    let attended = 0;
    let conducted = 0;

    Object.values(attendanceRecords || {}).forEach((record) => {
      if (record?.[subject.name] === 'present') {
        attended += 1;
        conducted += 1;
      } else if (record?.[subject.name] === 'absent') {
        conducted += 1;
      }
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

export function getOverallAttendance(summary) {
  const totalAttended = summary.reduce((sum, item) => sum + item.attended, 0);
  const totalConducted = summary.reduce((sum, item) => sum + item.conducted, 0);
  return calculateAttendance(totalAttended, totalConducted);
}
