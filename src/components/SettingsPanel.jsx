import React from 'react';

export default function SettingsPanel({ settings, onChangeThreshold, onExport, onImport, onReset, onClose, onToggleReminder, onRequestReminderPermission }) {
  const threshold = settings?.attendanceThreshold ?? settings?.threshold ?? 75;
  const reminderSettings = settings?.reminders || {};
  const attendanceReminderEnabled = reminderSettings.attendance !== false;
  const tomorrowClassesReminderEnabled = reminderSettings.tomorrowClasses !== false;

  const handleToggleReminder = async (type, enabled) => {
    if (enabled && typeof onRequestReminderPermission === 'function') {
      const granted = await onRequestReminderPermission();
      if (!granted) {
        return;
      }
    }

    if (typeof onToggleReminder === 'function') {
      onToggleReminder(type, enabled);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">System Preferences</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Settings</h2>
        </div>
        {onClose ? <button onClick={onClose} className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200">Close</button> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
          <label className="mb-2 block text-sm text-slate-400">Attendance Threshold</label>
          <select value={threshold} onChange={(event) => onChangeThreshold(Number(event.target.value))} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-100">
            <option value={75}>75%</option>
            <option value={80}>80%</option>
            <option value={85}>85%</option>
            <option value={90}>90%</option>
            <option value={95}>95%</option>
          </select>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Data Management</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onExport} className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-100">Export JSON</button>
            <label className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-100">
              Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(event) => event.target.files?.[0] && onImport(event.target.files[0])} />
            </label>
            <button onClick={onReset} className="rounded-2xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300">Reset All Data</button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">Reminder Notifications</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <div>
              <p className="text-sm font-medium text-white">Daily attendance reminder</p>
              <p className="text-xs text-slate-400">Notify around 5:00 PM if today is not marked.</p>
            </div>
            <button
              type="button"
              aria-label="Toggle attendance reminder"
              onClick={() => handleToggleReminder('attendance', !attendanceReminderEnabled)}
              className={`relative h-7 w-12 rounded-full transition ${attendanceReminderEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${attendanceReminderEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <div>
              <p className="text-sm font-medium text-white">Tomorrow's classes reminder</p>
              <p className="text-xs text-slate-400">Notify around 10:00 PM for your next class plan.</p>
            </div>
            <button
              type="button"
              aria-label="Toggle tomorrow classes reminder"
              onClick={() => handleToggleReminder('tomorrowClasses', !tomorrowClassesReminderEnabled)}
              className={`relative h-7 w-12 rounded-full transition ${tomorrowClassesReminderEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${tomorrowClassesReminderEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-sm font-semibold text-slate-100">PWA Information</p>
        <p className="mt-2 text-sm text-slate-400">Install this portal as an app for a faster, offline-ready experience on supported devices.</p>
      </div>
    </div>
  );
}
