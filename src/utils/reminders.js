const REMINDER_STORE_KEY = 'attendance-planner-reminder-log';

export function toIsoDate(date = new Date()) {
  const nextDate = new Date(date);
  const year = nextDate.getFullYear();
  const month = `${nextDate.getMonth() + 1}`.padStart(2, '0');
  const day = `${nextDate.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateKey(referenceDate = new Date()) {
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toIsoDate(tomorrow);
}

export function getStoredReminderLog() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(REMINDER_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setStoredReminderLog(nextValue) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(REMINDER_STORE_KEY, JSON.stringify(nextValue || {}));
}

export function hasReminderBeenSent(type, dateKey) {
  const logged = getStoredReminderLog();
  return !!logged?.[type]?.[dateKey];
}

export function markReminderSent(type, dateKey) {
  const logged = getStoredReminderLog();
  const nextLog = {
    ...logged,
    [type]: {
      ...(logged?.[type] || {}),
      [dateKey]: true,
    },
  };
  setStoredReminderLog(nextLog);
  return nextLog;
}

export function getTomorrowSubjectNames({ timetable = {}, subjects = [], referenceDate = new Date() } = {}) {
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const rawSubjects = Array.isArray(timetable?.[nextDayName]) ? timetable[nextDayName] : [];

  if (!rawSubjects.length) {
    return [];
  }

  const contextNames = new Set((subjects || []).map((subject) => subject?.name).filter(Boolean));

  return rawSubjects
    .map((subject) => (typeof subject === 'string' ? subject : subject?.name))
    .filter((subjectName) => {
      if (!subjectName || typeof subjectName !== 'string') {
        return false;
      }

      const trimmed = subjectName.trim();
      if (!trimmed) {
        return false;
      }

      if (!contextNames.size) {
        return true;
      }

      return contextNames.has(trimmed);
    })
    .filter((subjectName, index, list) => list.indexOf(subjectName) === index);
}

export function hasSavedAttendanceForDate(attendanceRecords = {}, dateKey) {
  const record = attendanceRecords?.[dateKey];
  return !!record && typeof record === 'object' && Object.keys(record).length > 0;
}

export function shouldSendReminder({ enabled, type, dateKey, reminderKey, subjectNames = [] } = {}) {
  if (!enabled) {
    return false;
  }

  if (!type) {
    return false;
  }

  if (type === 'tomorrowClasses') {
    return Array.isArray(subjectNames) && subjectNames.length > 0;
  }

  if (type === 'attendance') {
    return typeof dateKey === 'string' && typeof reminderKey === 'string' && reminderKey.length > 0;
  }

  return false;
}

export function getDueReminderQueue(data = {}, referenceDate = new Date()) {
  const reminderSettings = data?.settings?.reminders || {};
  const dateKey = toIsoDate(referenceDate);
  const hour = new Date(referenceDate).getHours();
  const queue = [];

  const attendanceReminderEnabled = reminderSettings.attendance !== false;
  if (attendanceReminderEnabled && hour >= 17 && !hasSavedAttendanceForDate(data?.attendance || {}, dateKey) && !hasReminderBeenSent('attendance', dateKey)) {
    queue.push({
      type: 'attendance',
      dateKey,
      id: `attendance-${dateKey}`,
      message: "Today's attendance hasn't been entered yet. Update it now?",
    });
  }

  const tomorrowClassesEnabled = reminderSettings.tomorrowClasses !== false;
  const tomorrowDateKey = getTomorrowDateKey(referenceDate);
  if (tomorrowClassesEnabled && hour >= 22) {
    const tomorrowSubjects = getTomorrowSubjectNames({ timetable: data?.timetable || {}, subjects: data?.subjects || [], referenceDate });
    if (tomorrowSubjects.length && !hasReminderBeenSent('tomorrowClasses', tomorrowDateKey)) {
      queue.push({
        type: 'tomorrowClasses',
        dateKey: tomorrowDateKey,
        id: `tomorrow-classes-${tomorrowDateKey}`,
        message: `Tomorrow's classes: ${tomorrowSubjects.join(', ')}. Review your plan?`,
      });
    }
  }

  return queue;
}
