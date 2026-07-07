import React, { useEffect, useMemo, useRef, useState } from 'react';
import SubjectManager from '../components/SubjectManager';
import TimetableBuilder from '../components/TimetableBuilder';
import TodayPage from '../components/TodayPage';
import BunkPredictor from '../components/BunkPredictor';
import CalendarView from '../components/CalendarView';
import { buildSubjectSummary, getOverallAttendance } from '../services/attendanceService';
import { academicCalendar } from '../data/academicCalendar';
import { getDayName } from '../utils/calendar';
import { formatPercent } from '../utils/attendance';

export default function PlannerPage({ data, onSave, onExport, onImport, onReset }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [draftAttendance, setDraftAttendance] = useState({});
  const attendanceSectionRef = useRef(null);
  const summary = useMemo(() => buildSubjectSummary(data.subjects, data.attendance, selectedDate, data.timetable, academicCalendar), [data.subjects, data.attendance, data.timetable, selectedDate]);
  const overall = useMemo(() => getOverallAttendance(summary), [summary]);
  const selectedDayClasses = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dayName = getDayName(selectedDate);
    return Array.isArray(data.timetable?.[dayName]) ? data.timetable[dayName] : [];
  }, [data.timetable, selectedDate]);

  useEffect(() => {
    setDraftAttendance(data.attendance?.[selectedDate] || {});
  }, [data.attendance, selectedDate]);

  useEffect(() => {
    attendanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedDate]);

  const saveAttendance = () => {
    const nextData = { ...data, attendance: { ...(data.attendance || {}), [selectedDate]: draftAttendance } };
    onSave(nextData);
  };

  const markAll = (status) => {
    const next = {};
    selectedDayClasses.filter(Boolean).forEach((subjectName) => {
      next[subjectName] = status;
    });
    setDraftAttendance(next);
  };

  const markOne = (subjectName, status) => {
    setDraftAttendance((current) => ({ ...current, [subjectName]: status }));
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="grid gap-3 sm:gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Overall Attendance</p>
          <p className="mt-2 text-3xl font-semibold">{formatPercent(overall)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Remaining Classes</p>
          <p className="mt-2 text-3xl font-semibold">{summary.reduce((sum, item) => sum + item.remaining, 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Working Days</p>
          <p className="mt-2 text-3xl font-semibold">{summary.length}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 sm:space-y-6">
          <div ref={attendanceSectionRef}>
            <TodayPage selectedDate={selectedDate} classes={selectedDayClasses} attendance={draftAttendance} onMarkAll={markAll} onMarkOne={markOne} onSave={saveAttendance} />
          </div>
          <TimetableBuilder timetable={data.timetable} subjects={data.subjects} onChange={(nextTimetable) => onSave({ ...data, timetable: nextTimetable })} />
        </div>
        <div className="space-y-6">
          <SubjectManager subjects={data.subjects} onAdd={() => onSave({ ...data, subjects: [...(data.subjects || []), { id: crypto.randomUUID(), name: `Subject ${(data.subjects || []).length + 1}`, color: '#60a5fa' }] })} onUpdate={(subjectId, nextName) => onSave({ ...data, subjects: (data.subjects || []).map((subject) => (subject.id === subjectId ? { ...subject, name: nextName } : subject)) })} onDelete={(subjectId) => onSave({ ...data, subjects: (data.subjects || []).filter((subject) => subject.id !== subjectId) })} />
          <BunkPredictor summary={summary} subjects={data.subjects} />
          <CalendarView selectedDate={selectedDate} onSelectDate={handleSelectDate} attendanceRecords={data.attendance} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="mb-4 text-lg font-semibold">Data Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={onExport} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Export JSON</button>
              <label className="rounded-lg border border-slate-700 px-3 py-2 text-sm">
                Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={(event) => event.target.files?.[0] && onImport(event.target.files[0])} />
              </label>
              <button onClick={onReset} className="rounded-lg border border-rose-500/40 px-3 py-2 text-sm text-rose-300">Reset All Data</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
