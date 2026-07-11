import React from 'react';

const baseItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'more', label: 'More' },
];

const moreItems = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'history', label: 'History' },
  { id: 'bunk', label: 'Bunk Planner' },
  { id: 'leave', label: 'Leave Planner' },
  { id: 'settings', label: 'Settings' },
];

export default function MobileNav({ activeView, onNavigate, onOpenMore }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 px-2 py-2 sm:hidden">
      <div className="grid grid-cols-6 gap-1">
        {baseItems.map((item) => (
          <button
            key={item.id}
            onClick={() => (item.id === 'more' ? onOpenMore() : onNavigate(item.id))}
            className={`rounded-xl px-1 py-2 text-[11px] ${activeView === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeView === 'more' ? (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2">
          {moreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
