import { academicCalendar } from '../data/academicCalendar';

function toIsoDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function parseIsoDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function hasHoliday(calendar = academicCalendar, normalizedDate) {
  return [
    calendar.holidays,
    calendar.poojaHolidays,
    calendar.deepavaliHolidays,
    calendar.customHolidays,
    calendar.midExams,
    calendar.endExams,
  ].some((list) => list?.includes(normalizedDate));
}

function getDateRule(dateString, calendar = academicCalendar) {
  const normalizedDate = toIsoDate(dateString);
  return calendar?.dateRules?.[normalizedDate] || null;
}

function normalizeTimetableEntries(timetableEntries = []) {
  return (timetableEntries || []).filter((entry) => entry !== null && entry !== undefined && entry !== '');
}

function getDefaultStatus(dateString, calendar = academicCalendar) {
  const date = new Date(dateString);
  const day = date.getDay();
  const normalizedDate = toIsoDate(date);

  if (day === 0 || day === 6) {
    return 'weekend';
  }

  if (normalizedDate < calendar.startDate || normalizedDate > calendar.lastWorkingDay) {
    return 'out-of-range';
  }

  if (hasHoliday(calendar, normalizedDate)) {
    return 'holiday';
  }

  return 'working';
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

export function getDateSchedule(dateString, timetable = {}, calendar = academicCalendar) {
  const normalizedDate = toIsoDate(dateString);
  const rule = getDateRule(normalizedDate, calendar);
  const dayName = getDayName(normalizedDate);
  const status = rule?.status || getDefaultStatus(normalizedDate, calendar);
  const isHoliday = status === 'holiday';
  const isNoClass = status === 'no-class';
  const isHalfDay = status === 'half-day';
  const isWorkingOverride = status === 'working' || status === 'half-day';
  const baseDayName = rule?.specialWorkingDaySource || dayName;
  const customTimetable = Array.isArray(rule?.customTimetable) ? rule.customTimetable : [];
  const dayTimetable = customTimetable.length
    ? customTimetable
    : Array.isArray(timetable?.[baseDayName]) ? timetable[baseDayName] : [];
  const disabledPeriods = Array.isArray(rule?.disabledPeriods) ? rule.disabledPeriods : [];
  const activeTimetable = isHoliday || isNoClass
    ? []
    : normalizeTimetableEntries(dayTimetable).filter((_, index) => {
        const period = `P${index + 1}`;
        const periodNumber = index + 1;
        return !disabledPeriods.includes(period) && !disabledPeriods.includes(periodNumber);
      });

  return {
    date: normalizedDate,
    status,
    dayName,
    baseDayName,
    timetable: activeTimetable,
    disabledPeriods,
    isHoliday,
    isNoClass,
    isHalfDay,
    isWorkingDay: isWorkingOverride || (status === 'working' && !isHoliday && !isNoClass),
  };
}

export function isWorkingDay(dateString, calendar = academicCalendar) {
  return getDateSchedule(dateString, {}, calendar).isWorkingDay;
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
