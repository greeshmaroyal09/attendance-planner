import React, { useMemo, useState } from 'react';
import { buildLeavePrediction } from '../services/attendanceService';
import { formatPercent } from '../utils/attendance';

export default function LeavePlanner({ subjects = [], attendanceRecords = {}, timetable = {}, calendar = null, threshold = 75 }) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const rows = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) {
      return [];
    }

    return buildLeavePrediction(subjects, attendanceRecords, startDate, endDate, timetable, calendar, threshold);
  }, [subjects, attendanceRecords, startDate, endDate, timetable, calendar, threshold]);

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Leave Planner</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Predict attendance impact for a date range</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="text-sm text-slate-400">
            <span className="mb-1 block">From</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
          </label>
          <label className="text-sm text-slate-400">
            <span className="mb-1 block">To</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/80 text-left text-slate-400">
            <tr>
              <th className="px-3 py-3 font-medium">Subject</th>
              <th className="px-3 py-3 font-medium">Current %</th>
              <th className="px-3 py-3 font-medium">Current Conducted</th>
              <th className="px-3 py-3 font-medium">Current Present</th>
              <th className="px-3 py-3 font-medium">Future Missed</th>
              <th className="px-3 py-3 font-medium">Predicted %</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
            {rows.map((row) => (
              <tr key={row.id || row.name}>
                <td className="px-3 py-3 font-medium text-white">{row.name}</td>
                <td className="px-3 py-3">{formatPercent(row.currentPercentage)}</td>
                <td className="px-3 py-3">{row.currentConducted}</td>
                <td className="px-3 py-3">{row.currentPresent}</td>
                <td className="px-3 py-3">{row.futureMissed}</td>
                <td className="px-3 py-3">{formatPercent(row.predictedPercentage)}</td>
                <td className={`px-3 py-3 font-medium ${row.status === 'Safe' ? 'text-emerald-300' : row.status === 'Warning' ? 'text-amber-300' : 'text-rose-300'}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
