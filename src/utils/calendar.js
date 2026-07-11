import { academicCalendar } from '../data/academicCalendar';

function toIsoDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function parseIsoDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getDateRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(toIsoDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isWorkingDay(dateString, calendar = academicCalendar) {
  const date = new Date(dateString);
  const day = date.getDay();
  const normalizedDate = toIsoDate(date);
  if (day === 0 || day === 6) return false;
  if (normalizedDate < calendar.startDate || normalizedDate > calendar.lastWorkingDay) return false;
  if (calendar.holidays?.includes(normalizedDate)) return false;
  if (calendar.poojaHolidays?.includes(normalizedDate)) return false;
  if (calendar.deepavaliHolidays?.includes(normalizedDate)) return false;
  if (calendar.customHolidays?.includes(normalizedDate)) return false;
  if (calendar.midExams?.includes(normalizedDate)) return false;
  if (calendar.endExams?.includes(normalizedDate)) return false;
  return true;
}

export function getWorkingDays(calendar = academicCalendar) {
  return getDateRange(calendar.startDate, calendar.lastWorkingDay).filter((date) => isWorkingDay(date, calendar));
}

export function getCalendarStats(calendar = academicCalendar) {
  const workingDays = getWorkingDays(calendar);
  return {
    workingDaysCount: workingDays.length,
    holidayCount: calendar.holidays?.length || 0,
    poojaHolidayCount: calendar.poojaHolidays?.length || 0,
    deepavaliHolidayCount: calendar.deepavaliHolidays?.length || 0,
    customHolidayCount: calendar.customHolidays?.length || 0,
    examCount: (calendar.midExams?.length || 0) + (calendar.endExams?.length || 0),
  };
}

export function getDayName(dateString) {
  const date = parseIsoDate(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}
