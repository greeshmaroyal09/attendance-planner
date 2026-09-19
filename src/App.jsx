import React, { useEffect, useState } from 'react';
import PlannerPage from './pages/PlannerPage';
import { exportUserData, importUserData, loadUserData, saveUserData } from './storage/localStorage';
import { getDueReminderQueue, markReminderSent } from './utils/reminders';

const defaultData = {
  subjects: [{ id: crypto.randomUUID(), name: 'OS', color: '#60a5fa' }],
  timetable: {
    Monday: ['OS'],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  },
  attendance: {},
  dateRules: {},
  settings: {
    thresholds: [75, 80, 85, 90, 95],
    reminders: {
      attendance: true,
      tomorrowClasses: true,
    },
  },
};

function App() {
  const [data, setData] = useState(() => loadUserData() || defaultData);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return undefined;
    }

    const sendPending = () => {
      if (Notification.permission !== 'granted') {
        return;
      }

      const due = getDueReminderQueue(data, new Date());
      due.forEach((reminder) => {
        const message = reminder.message;
        new Notification('Attendance Reminder', {
          body: message,
          tag: reminder.id,
        });
        markReminderSent(reminder.type, reminder.dateKey);
      });
    };

    sendPending();
    const intervalId = window.setInterval(sendPending, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [data]);

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
