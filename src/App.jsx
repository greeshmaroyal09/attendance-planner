import React, { useState } from 'react';
import PlannerPage from './pages/PlannerPage';
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PlannerPage data={data} onSave={persist} onExport={handleExport} onImport={handleImport} onReset={handleReset} />
    </div>
  );
}

export default App;
