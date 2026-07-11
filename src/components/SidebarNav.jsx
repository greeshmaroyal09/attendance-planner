import React from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'subjects', label: 'Subjects', icon: '◫' },
  { id: 'timetable', label: 'Timetable', icon: '◧' },
  { id: 'attendance', label: 'Attendance', icon: '✓' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'history', label: 'History', icon: '◔' },
  { id: 'bunk', label: 'Bunk Planner', icon: '⚑' },
  { id: 'leave', label: 'Leave Planner', icon: '☼' },
  { id: 'analytics', label: 'Analytics', icon: '◌' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function SidebarNav({ activeView, onNavigate, onClose, isOpen }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/70 transition-opacity duration-300 lg:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950/95 px-4 py-5 shadow-2xl shadow-slate-950/60 transition-transform duration-300 lg:sticky lg:top-0 lg:h-auto lg:min-h-screen lg:translate-x-0 lg:rounded-none lg:border-r lg:bg-slate-950/70 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-400">SIS</p>
            <h2 className="text-lg font-semibold text-slate-100">KARE Portal</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-700 p-2 text-slate-300 lg:hidden">
            ✕
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id || (item.id === 'dashboard' && activeView === 'dashboard');
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-all ${isActive ? 'bg-cyan-600/20 text-cyan-300 shadow-lg shadow-cyan-950/30' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-base">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm font-semibold text-slate-100">Semester Focus</p>
          <p className="mt-2 text-sm text-slate-400">Stay ahead with attendance insights and campus-ready planning.</p>
        </div>
      </aside>
    </>
  );
}
