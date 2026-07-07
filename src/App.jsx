import React, { useState } from 'react';
import PlannerPage from './pages/PlannerPage';
import { academicCalendar } from './data/academicCalendar';
import { exportUserData, importUserData, loadUserData, saveUserData } from './storage/localStorage';

const defaultData = {
  subjects: [{ id: crypto.randomUUID(), name: 'OS', color: '#60a5fa' }],
  timetable: {
    Monday: ['OS'],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  },
  attendance: {},
  settings: {
    thresholds: [75, 80, 85, 90],
  },
};

function App() {
  const [data, setData] = useState(() => loadUserData() || defaultData);

  const persist = (nextData) => {
    setData(nextData);
    saveUserData(nextData);
  };

  const handleExport = () => exportUserData(data);
  const handleImport = async (file) => {
    try {
      const imported = await importUserData(file);
      persist(imported);
    } catch (error) {
      window.alert(error.message);
    }
  };
  const handleReset = () => {
    if (window.confirm('Reset all attendance planner data?')) {
      persist(defaultData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Offline Attendance Planning</p>
              <h1 className="text-2xl font-semibold">Attendance Planner & Bunk Predictor</h1>
              <p className="mt-1 text-sm text-slate-400">Built-in KARE Odd Semester 2026-27 calendar</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
              {academicCalendar.semesterName}
            </div>
          </div>
        </header>
        <PlannerPage data={data} onSave={persist} onExport={handleExport} onImport={handleImport} onReset={handleReset} />
      </div>
    </div>
  );
}

export default App;
