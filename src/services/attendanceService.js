import { calculateAttendance } from '../utils/attendance';
import { getDayName, isWorkingDay } from '../utils/calendar';

function getDateRangeFrom(selectedDate, calendar) {
  const dates = [];
  const start = new Date(`${selectedDate}T00:00:00Z`);
  const end = new Date(`${calendar.lastWorkingDay}T00:00:00Z`);
  const current = new Date(start);

  while (current <= end) {
    const isoDate = current.toISOString().split('T')[0];
    dates.push(isoDate);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function buildSubjectSummary(subjects, attendanceRecords, selectedDate = new Date().toISOString().split('T')[0], timetable = {}, calendar = null) {
  const calendarData = calendar || { lastWorkingDay: new Date().toISOString().split('T')[0] };
  const futureDates = getDateRangeFrom(selectedDate, calendarData)
    .filter((date) => date > selectedDate)
    .filter((date) => isWorkingDay(date, calendarData));

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

    const futureOccurrences = futureDates.reduce((count, date) => {
      const dayName = getDayName(date);
      const dayTimetable = timetable?.[dayName] || [];
      return count + dayTimetable.filter((subjectName) => subjectName === subject.name).length;
    }, 0);

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
