export function buildPeriodSlots(dayTimetable = []) {
  return (dayTimetable || []).map((subjectName, index) => ({
    period: `P${index + 1}`,
    subjectName: subjectName || '',
    isEmpty: !subjectName || subjectName.trim() === '',
  }));
}
