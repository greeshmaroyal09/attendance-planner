import React from 'react';

export default function SubjectManager({ subjects, onAdd, onUpdate, onDelete }) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Academic Setup</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Subjects</h2>
        </div>
        <button onClick={onAdd} className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-medium text-white">Add Subject</button>
      </div>
      <div className="space-y-3">
        {(subjects || []).map((subject) => (
          <div key={subject.id} className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:flex-row sm:items-center">
            <input value={subject.name} onChange={(event) => onUpdate(subject.id, event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-100" />
            <button onClick={() => onDelete(subject.id)} className="rounded-2xl border border-rose-500/40 px-3 py-3 text-sm font-medium text-rose-300">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
