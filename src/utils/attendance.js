export function calculateAttendance(attended, conducted) {
  if (!conducted) return 0;
  return Number(((attended / conducted) * 100).toFixed(2));
}

export function getSafeBunks(attendance, conducted, remainingClasses, threshold = 75) {
  if (!remainingClasses || !conducted) return 0;
  const requiredTotalAttended = Math.ceil((threshold / 100) * (conducted + remainingClasses));
  const currentAttended = Math.round((attendance / 100) * conducted);
  const requiredFutureAttends = Math.max(0, requiredTotalAttended - currentAttended);
  return Math.max(0, remainingClasses - requiredFutureAttends);
}

export function getThresholdRequirement(attendance, conducted, remainingClasses, threshold = 75) {
  if (!conducted) return 0;
  const currentAttended = Math.round((attendance / 100) * conducted);
  const requiredTotalAttended = Math.ceil((threshold / 100) * (conducted + remainingClasses));
  return Math.max(0, requiredTotalAttended - currentAttended);
}

export function getProjectedAttendance(attended, conducted, skipped) {
  return calculateAttendance(attended, conducted + skipped);
}

export function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}
