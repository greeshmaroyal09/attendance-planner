const STORAGE_KEY = 'attendance-planner-user-data';
const DEFAULT_THRESHOLDS = [75, 80, 85, 90, 95];

function createDefaultSettings() {
  return {
    attendanceThreshold: 75,
    thresholds: DEFAULT_THRESHOLDS,
    reminders: {
      attendance: true,
      tomorrowClasses: true,
    },
  };
}

export function normalizeUserData(data) {
  const defaultData = {
    subjects: [{ id: crypto.randomUUID(), name: 'OS', color: '#60a5fa' }],
    timetable: {
      Monday: ['OS'],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
    attendance: {},
    dateRules: {},
    settings: createDefaultSettings(),
  };

  if (!data || typeof data !== 'object') {
    return defaultData;
  }

  const nextData = { ...defaultData, ...data };
  nextData.subjects = Array.isArray(data.subjects) && data.subjects.length ? data.subjects : defaultData.subjects;
  nextData.timetable = data.timetable && typeof data.timetable === 'object' ? data.timetable : defaultData.timetable;
  nextData.attendance = data.attendance && typeof data.attendance === 'object' ? data.attendance : {};
  nextData.dateRules = data.dateRules && typeof data.dateRules === 'object' ? data.dateRules : {};
  const normalizedThresholds = Array.from(new Set([
    ...DEFAULT_THRESHOLDS,
    ...(Array.isArray(data.settings?.thresholds) ? data.settings.thresholds.filter((value) => typeof value === 'number' && Number.isFinite(value)) : []),
  ])).sort((a, b) => a - b);

  const reminderSettings = {
    attendance: data.settings?.reminders?.attendance ?? true,
    tomorrowClasses: data.settings?.reminders?.tomorrowClasses ?? true,
  };

  nextData.settings = {
    ...createDefaultSettings(),
    ...(data.settings || {}),
    thresholds: normalizedThresholds,
    attendanceThreshold: data.settings?.attendanceThreshold ?? data.threshold ?? 75,
    reminders: {
      ...createDefaultSettings().reminders,
      ...(data.settings?.reminders || {}),
      ...reminderSettings,
    },
  };

  return nextData;
}

export function loadUserData() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return normalizeUserData(parsed);
  } catch {
    return null;
  }
}

export function saveUserData(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportUserData(data) {
  const blob = new Blob([JSON.stringify(normalizeUserData(data), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'attendance-planner-user-data.json';
  link.click();
  URL.revokeObjectURL(url);
}

export function importUserData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
