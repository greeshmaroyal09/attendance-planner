import React from 'react';
import { buildPeriodSlots } from '../utils/timetable';

export default function TodayPage({ selectedDate, classes, attendance, onMarkAll, onMarkOne, onSave }) {
  const slots = buildPeriodSlots(classes);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendance for {selectedDate}</h2>
          <p className="text-sm text-slate-400">Saved records remain available for future edits.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => onMarkAll('present')} className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-medium">Mark All Present</button>
          <button onClick={() => onMarkAll('absent')} className="rounded-lg bg-rose-600 px-3 py-3 text-sm font-medium">Mark All Absent</button>
        </div>
      </div>
      <div className="space-y-3">
        {slots.length ? slots.map((slot) => (
          <div key={slot.period} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-sm font-medium text-cyan-300">{slot.period}</span>
              <span className="font-medium">{slot.isEmpty ? 'No Class' : slot.subjectName}</span>
            </div>
            {!slot.isEmpty && (
              <div className="flex w-full gap-2 sm:w-auto">
                <button onClick={() => onMarkOne(slot.subjectName, 'present')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-medium sm:flex-none ${attendance?.[slot.subjectName] === 'present' ? 'bg-emerald-600' : 'bg-slate-800'}`}>Present</button>
                <button onClick={() => onMarkOne(slot.subjectName, 'absent')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-medium sm:flex-none ${attendance?.[slot.subjectName] === 'absent' ? 'bg-rose-600' : 'bg-slate-800'}`}>Absent</button>
              </div>
            )}
          </div>
        )) : <p className="text-sm text-slate-400">No classes scheduled for this day.</p>}
      </div>
      <button onClick={onSave} className="mt-4 w-full rounded-lg bg-cyan-600 px-3 py-3 text-sm font-medium sm:w-auto">Save Attendance</button>
    </div>
  );
}
