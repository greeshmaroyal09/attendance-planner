import React from 'react';

export default function TimetableBuilder({ timetable, subjects, onChange }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const updateDay = (day, value) => {
    onChange({ ...timetable, [day]: value });
  };

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Weekly Schedule</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Timetable Builder</h2>
        </div>
        <p className="text-sm text-slate-400">Build your own weekly grid</p>
      </div>
      <div className="space-y-4">
        {days.map((day) => (
          <div key={day} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-200">{day}</p>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {periods.map((period, index) => {
                const value = timetable?.[day]?.[index] || '';
                return (
                  <select key={`${day}-${period}`} value={value} onChange={(event) => {
                    const nextDay = [...(timetable?.[day] || [])];
                    nextDay[index] = event.target.value;
                    updateDay(day, nextDay);
                  }} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-100">
                    <option value="">Empty</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
