export function migrateLegacyData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const nextData = { ...data };
  if (!nextData.settings) {
    nextData.settings = {
      attendanceThreshold: 75,
      thresholds: [75, 80, 85, 90, 95],
    };
  }

  if (typeof nextData.settings?.attendanceThreshold === 'undefined' && typeof nextData.threshold === 'number') {
    nextData.settings.attendanceThreshold = nextData.threshold;
  }

  if (Array.isArray(nextData.settings?.thresholds)) {
    nextData.settings.thresholds = Array.from(new Set([75, 80, 85, 90, 95, ...nextData.settings.thresholds])).sort((a, b) => a - b);
  }

  return nextData;
}
