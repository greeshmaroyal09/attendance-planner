import React, { useMemo, useState } from "react";
import { getDateSchedule } from "../utils/calendar";
import { buildPeriodSlots } from "../utils/timetable";

export default function TodayPage({
  selectedDate,
  classes,
  attendance,
  timetable = {},
  dateRule = null,
  calendar = null,
  onMarkAll,
  onMarkOne,
  onSave,
  onClear,
  onDeleteDate,
  onUpdateDateRule,
}) {
  const [saved, setSaved] = useState(false);
  const schedule = useMemo(() => getDateSchedule(selectedDate, timetable, calendar), [selectedDate, timetable, calendar]);
  const weekdayOptions = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter((day) => day in (timetable || {})), [timetable]);
  const baseTimetable = useMemo(() => {
    if (Array.isArray(dateRule?.customTimetable) && dateRule.customTimetable.length) {
      return dateRule.customTimetable;
    }
    if (dateRule?.specialWorkingDaySource && Array.isArray(timetable?.[dateRule.specialWorkingDaySource])) {
      return timetable[dateRule.specialWorkingDaySource];
    }
    return schedule.timetable || [];
  }, [dateRule, timetable, schedule.timetable]);
  const periodCount = Math.max(1, baseTimetable.length || 1);
  const periodEntries = Array.from({ length: periodCount }, (_, index) => {
    const periodLabel = `P${index + 1}`;
    const isDisabled = (dateRule?.disabledPeriods || []).includes(periodLabel) || (dateRule?.disabledPeriods || []).includes(index + 1);
    return { periodLabel, isDisabled };
  });
  const updateDateRule = (patch) => {
    if (!onUpdateDateRule) {
      return;
    }
    const nextRule = { ...(dateRule || {}), ...patch };
    if (!nextRule.status) {
      nextRule.status = 'working';
    }
    onUpdateDateRule(selectedDate, nextRule);
  };

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
            {schedule.status === 'no-class' ? 'This date is marked as a no-class day.' : schedule.status === 'half-day' ? 'Only selected periods count on this half-day.' : 'Mark today’s classes and save your updates when ready.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => onMarkAll("present")} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white">Mark All Present</button>
          <button onClick={() => onMarkAll("absent")} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white">Mark All Absent</button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">Date mode</span>
            <select value={schedule.status} onChange={(event) => updateDateRule({ status: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100">
              <option value="working">Working Day</option>
              <option value="holiday">Holiday</option>
              <option value="no-class">No Class Day</option>
              <option value="half-day">Half Day</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">Use timetable from</span>
            <select value={dateRule?.specialWorkingDaySource || ''} onChange={(event) => updateDateRule({ specialWorkingDaySource: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100">
              <option value="">Default weekday</option>
              {weekdayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm text-slate-300">
          <span className="mb-1 block text-slate-400">Custom timetable (comma separated)</span>
          <input value={Array.isArray(dateRule?.customTimetable) ? dateRule.customTimetable.join(', ') : ''} onChange={(event) => updateDateRule({ customTimetable: event.target.value.split(',').map((entry) => entry.trim()).filter(Boolean) })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100" placeholder="OS, Math, DBMS" />
        </label>
        {schedule.status === 'half-day' && (
          <div className="mt-3">
            <p className="mb-2 text-sm text-slate-400">Disable periods for this date</p>
            <div className="flex flex-wrap gap-2">
              {periodEntries.map((entry) => (
                <button key={entry.periodLabel} type="button" onClick={() => {
                  const nextDisabledPeriods = [...(dateRule?.disabledPeriods || [])];
                  const periodValue = entry.periodLabel;
                  const index = nextDisabledPeriods.indexOf(periodValue);
                  if (index >= 0) nextDisabledPeriods.splice(index, 1);
                  else nextDisabledPeriods.push(periodValue);
                  updateDateRule({ disabledPeriods: nextDisabledPeriods });
                }} className={`rounded-full border px-3 py-1 text-sm ${entry.isDisabled ? 'border-amber-500 bg-amber-500/20 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-200'}`}>
                  {entry.periodLabel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {schedule.status === 'no-class' ? (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 text-sm text-violet-200">
            No classes are scheduled for this day, so there is nothing to mark.
          </div>
        ) : slots.length ? (
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
          disabled={schedule.status === 'no-class'}
          className={`w-full rounded-2xl px-3 py-3 text-sm font-medium sm:w-auto transition-all ${
            saved ? "bg-emerald-600" : "bg-cyan-600"
          } ${schedule.status === 'no-class' ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {saved ? "✓ Saved Successfully" : "Save Attendance"}
        </button>

        <button onClick={onClear} className="w-full rounded-2xl border border-rose-500/40 px-3 py-3 text-sm font-medium text-rose-300 sm:w-auto">Clear Attendance</button>
        <button onClick={onDeleteDate} className="w-full rounded-2xl border border-slate-700 px-3 py-3 text-sm font-medium text-slate-300 sm:w-auto">Delete for Date</button>
      </div>
    </div>
  );
} 
