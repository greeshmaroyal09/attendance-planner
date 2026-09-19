const FEATURE_VIEWS = new Set([
  'subjects',
  'timetable',
  'attendance',
  'calendar',
  'history',
  'bunk',
  'leave',
  'analytics',
  'settings',
]);

export function getNavigationStateFromHash(hash = window.location.hash || '') {
  const normalized = (hash || '').replace(/^#/, '').replace(/^\/+/, '');

  if (!normalized) {
    return { type: 'root' };
  }

  const feature = normalized.split('/')[0];

  if (!FEATURE_VIEWS.has(feature)) {
    return { type: 'root' };
  }

  return { type: 'feature', view: feature };
}

export function createNavigationEntry(view) {
  if (!view || view === 'dashboard') {
    return '';
  }

  return FEATURE_VIEWS.has(view) ? '#/' + view : '';
}
