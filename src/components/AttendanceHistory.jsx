import React, { useMemo, useState } from 'react';

const getMonthKey = (dateString) => dateString.slice(0, 7);

export default function AttendanceHistory({ attendanceRecords, onSelectDate }) {
  const groupedMonths = useMemo(() => {
    const monthMap = new Map();

    Object.entries(attendanceRecords || {})
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([date, record]) => {
        const monthKey = getMonthKey(date);
        if (!monthMap.has(monthKey)) {
          const [year, month] = monthKey.split('-');
          monthMap.set(monthKey, {
            key: monthKey,
            label: new Date(`${year}-${month}-01T00:00:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            dates: [],
          });
        }

        monthMap.get(monthKey).dates.push([date, record]);
      });

    return [...monthMap.values()].map((group) => ({
      ...group,
      dates: group.dates.sort(([a], [b]) => b.localeCompare(a)),
    }));
  }, [attendanceRecords]);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const visibleDates = groupedMonths.find((group) => group.key === selectedMonth)?.dates || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h2 className="mb-4 text-lg font-semibold">Attendance History</h2>

      {!groupedMonths.length ? (
        <p className="text-sm text-slate-400">No attendance history yet.</p>
      ) : selectedMonth ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedMonth(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
            ← Back to Months
          </button>

          <div className="space-y-2">
            {visibleDates.length ? (
              visibleDates.map(([date, record]) => (
                <button key={date} onClick={() => onSelectDate(date)} className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm">
                  <span>{date}</span>
                  <span className="text-slate-400">{Object.keys(record || {}).length} saved entries</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">No attendance records found for this month.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {groupedMonths.map((group) => (
            <button
              key={group.key}
              onClick={() => setSelectedMonth(group.key)}
              className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-4 text-left text-sm font-medium text-slate-200 transition hover:border-slate-700"
            >
              {group.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
