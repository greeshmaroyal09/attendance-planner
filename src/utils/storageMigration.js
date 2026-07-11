export function migrateLegacyData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const nextData = { ...data };
  if (!nextData.settings) {
    nextData.settings = {
      attendanceThreshold: 75,
      thresholds: [75, 80, 85, 90],
    };
  }

  if (typeof nextData.settings?.attendanceThreshold === 'undefined' && typeof nextData.threshold === 'number') {
    nextData.settings.attendanceThreshold = nextData.threshold;
  }

  return nextData;
}
