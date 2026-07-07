import React, { useMemo, useState } from 'react';
import { formatPercent, getSafeBunks } from '../utils/attendance';

export default function BunkPredictor({ summary, subjects }) {
  const [threshold, setThreshold] = useState(75);
  const visibleSummary = useMemo(() => (summary || []).filter((item) => item && item.name), [summary]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Bunk Predictor</h2>
        <select value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-sm">
          <option value={75}>75%</option>
          <option value={80}>80%</option>
          <option value={85}>85%</option>
          <option value={90}>90%</option>
        </select>
      </div>
      <div className="space-y-3">
        {visibleSummary.map((item) => {
          const safeBunks = getSafeBunks(item.percentage, item.conducted, item.remaining, threshold);
          const isDanger = safeBunks <= 0;

          return (
            <div key={item.id || item.name} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-sm font-medium text-slate-200">{item.name}</p>
              <p className="mt-2 text-sm text-slate-400">Attendance: {formatPercent(item.percentage)}</p>
              <p className="mt-1 text-sm text-slate-400">Safe Bunks Remaining: {safeBunks}</p>
              {isDanger && <p className="mt-2 text-sm font-semibold text-rose-400">Danger</p>}
            </div>
          );
        })}
      </div>
      {!visibleSummary.length && <p className="text-sm text-slate-400">Add subjects to see subject-wise bunk guidance.</p>}
    </div>
  );
}
