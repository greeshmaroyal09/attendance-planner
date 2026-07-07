import React from 'react';

export default function AttendanceHistory({ attendanceRecords, onSelectDate }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h2 className="mb-4 text-lg font-semibold">Attendance History</h2>
      <div className="space-y-2">
        {Object.entries(attendanceRecords || {}).sort(([a], [b]) => b.localeCompare(a)).map(([date, record]) => (
          <button key={date} onClick={() => onSelectDate(date)} className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm">
            <span>{date}</span>
            <span className="text-slate-400">{Object.keys(record || {}).length} saved entries</span>
          </button>
        ))}
      </div>
    </div>
  );
}
