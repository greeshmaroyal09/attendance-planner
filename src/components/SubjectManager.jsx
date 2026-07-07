import React from 'react';

export default function SubjectManager({ subjects, onAdd, onUpdate, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Subjects</h2>
        <button onClick={onAdd} className="rounded-lg bg-cyan-600 px-3 py-3 text-sm font-medium">Add Subject</button>
      </div>
      <div className="space-y-3">
        {(subjects || []).map((subject) => (
          <div key={subject.id} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:flex-row sm:items-center">
            <input value={subject.name} onChange={(event) => onUpdate(subject.id, event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm" />
            <button onClick={() => onDelete(subject.id)} className="rounded-lg border border-rose-500/40 px-3 py-3 text-sm font-medium text-rose-300">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
