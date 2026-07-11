import React, { useState } from "react";
import { buildPeriodSlots } from "../utils/timetable";

export default function TodayPage({
  selectedDate,
  classes,
  attendance,
  onMarkAll,
  onMarkOne,
  onSave,
  onClear,
  onDeleteDate,
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const slots = buildPeriodSlots(classes);

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Attendance Entry</p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {selectedDate}
          </h2>
          <p className="text-sm text-slate-400">
            Mark today’s classes and save your updates when ready.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => onMarkAll("present")} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white">Mark All Present</button>
          <button onClick={() => onMarkAll("absent")} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white">Mark All Absent</button>
        </div>
      </div>

      <div className="space-y-3">
        {slots.length ? (
          slots.map((slot) => (
            <div
              key={slot.period}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm font-medium text-cyan-300">
                  {slot.period}
                </span>

                <span className="font-medium">
                  {slot.isEmpty ? "No Class" : slot.subjectName}
                </span>
              </div>

              {!slot.isEmpty && (
                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    onClick={() =>
                      onMarkOne(slot.subjectName, "present")
                    }
                    className={`flex-1 rounded-lg px-3 py-3 text-sm font-medium sm:flex-none ${
                      attendance?.[slot.subjectName] === "present"
                        ? "bg-emerald-600"
                        : "bg-slate-800"
                    }`}
                  >
                    Present
                  </button>

                  <button
                    onClick={() =>
                      onMarkOne(slot.subjectName, "absent")
                    }
                    className={`flex-1 rounded-lg px-3 py-3 text-sm font-medium sm:flex-none ${
                      attendance?.[slot.subjectName] === "absent"
                        ? "bg-rose-600"
                        : "bg-slate-800"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            No classes scheduled for this day.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          onClick={handleSave}
          className={`w-full rounded-2xl px-3 py-3 text-sm font-medium sm:w-auto transition-all ${
            saved ? "bg-emerald-600" : "bg-cyan-600"
          }`}
        >
          {saved ? "✓ Saved Successfully" : "Save Attendance"}
        </button>

        <button onClick={onClear} className="w-full rounded-2xl border border-rose-500/40 px-3 py-3 text-sm font-medium text-rose-300 sm:w-auto">Clear Attendance</button>
        <button onClick={onDeleteDate} className="w-full rounded-2xl border border-slate-700 px-3 py-3 text-sm font-medium text-slate-300 sm:w-auto">Delete for Date</button>
      </div>
    </div>
  );
} 
