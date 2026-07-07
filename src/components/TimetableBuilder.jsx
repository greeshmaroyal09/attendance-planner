import React from 'react';

export default function TimetableBuilder({ timetable, subjects, onChange }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const updateDay = (day, value) => {
    onChange({ ...timetable, [day]: value });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Timetable Builder</h2>
        <p className="text-sm text-slate-400">Build your own weekly grid</p>
      </div>
      <div className="space-y-4">
        {days.map((day) => (
          <div key={day} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-sm font-medium text-slate-300">{day}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {periods.map((period, index) => {
                const value = timetable?.[day]?.[index] || '';
                return (
                  <select key={`${day}-${period}`} value={value} onChange={(event) => {
                    const nextDay = [...(timetable?.[day] || [])];
                    nextDay[index] = event.target.value;
                    updateDay(day, nextDay);
                  }} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-3 text-sm">
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
