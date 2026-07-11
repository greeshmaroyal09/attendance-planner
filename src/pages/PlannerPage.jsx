import React, { useEffect, useMemo, useRef, useState } from 'react';
import SubjectManager from '../components/SubjectManager';
import TimetableBuilder from '../components/TimetableBuilder';
import TodayPage from '../components/TodayPage';
import BunkPredictor from '../components/BunkPredictor';
import CalendarView from '../components/CalendarView';
import SettingsPanel from '../components/SettingsPanel';
import SidebarNav from '../components/SidebarNav';
import AttendanceHistory from '../components/AttendanceHistory';
import { buildSubjectSummary, clearAttendanceForDate, getOverallAttendance, normalizeAttendanceRecords } from '../services/attendanceService';
import { academicCalendar } from '../data/academicCalendar';
import { getDayName } from '../utils/calendar';
import { formatPercent, getSafeBunks } from '../utils/attendance';

export default function PlannerPage({ data, onSave, onExport, onImport, onReset }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [draftAttendance, setDraftAttendance] = useState({});
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const normalizedDraft = Object.entries(draftAttendance || {}).reduce((acc, [subjectName, status]) => {
      if (status === 'present' || status === 'absent') {
        acc[subjectName] = status;
      }
      return acc;
    }, {});

    const nextAttendance = normalizeAttendanceRecords(
      { ...(data.attendance || {}), [selectedDate]: normalizedDraft },
      data.subjects,
      data.timetable,
      academicCalendar,
    );

    const nextData = { ...data, attendance: nextAttendance };
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

  const clearAttendance = () => {
    if (!window.confirm('Clear the saved attendance for this date?')) {
      return;
    }

    const nextAttendance = clearAttendanceForDate(data.attendance || {}, selectedDate);
    setDraftAttendance({});
    onSave({ ...data, attendance: nextAttendance });
  };

  const deleteAttendanceForDate = () => {
    if (!window.confirm('Delete all saved attendance for this date?')) {
      return;
    }

    const nextAttendance = clearAttendanceForDate(data.attendance || {}, selectedDate);
    setDraftAttendance({});
    onSave({ ...data, attendance: nextAttendance });
  };

  const handleThresholdChange = (nextThreshold) => {
    onSave({ ...data, settings: { ...(data.settings || {}), attendanceThreshold: nextThreshold, thresholds: [...(data.settings?.thresholds || [75, 80, 85, 90])] } });
  };

  const handleNavigate = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
    if (view === 'attendance') {
      attendanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">Student Portal Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Welcome back, student</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Track your attendance, plan your classes and stay ahead of your semester goals.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-slate-100">{academicCalendar.semesterName}</p>
            <p className="mt-1 text-slate-400">Today: {selectedDate}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Overall Attendance', value: formatPercent(overall), accent: 'from-cyan-500/20 to-cyan-500/5' },
            { label: 'Classes Attended', value: summary.reduce((sum, item) => sum + item.attended, 0), accent: 'from-emerald-500/20 to-emerald-500/5' },
            { label: 'Classes Missed', value: summary.reduce((sum, item) => sum + Math.max(0, item.conducted - item.attended), 0), accent: 'from-rose-500/20 to-rose-500/5' },
            { label: 'Remaining Classes', value: summary.reduce((sum, item) => sum + item.remaining, 0), accent: 'from-amber-500/20 to-amber-500/5' },
            { label: 'Safe Bunks', value: summary.reduce((sum, item) => sum + Math.max(0, Math.min(item.remaining, Math.max(0, Math.floor((item.percentage / 100) * item.conducted) - Math.ceil((75 / 100) * (item.conducted + item.remaining)) + item.remaining))), 0), accent: 'from-violet-500/20 to-violet-500/5' },
          ].map((card) => (
            <div key={card.label} className={`rounded-3xl border border-slate-800 bg-gradient-to-br ${card.accent} p-4`}>
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Attendance by Subject</h3>
            <p className="text-sm text-slate-400">Live subject-level progress with safety status.</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {summary.map((item) => {
            const safeBunks = getSafeBunks(item.percentage, item.conducted, item.remaining, data.settings?.attendanceThreshold ?? 75);
            const status = safeBunks > 0 ? 'Safe' : item.percentage >= (data.settings?.attendanceThreshold ?? 75) - 5 ? 'Warning' : 'Danger';
            const statusTone = status === 'Safe' ? 'text-emerald-300' : status === 'Warning' ? 'text-amber-300' : 'text-rose-300';
            return (
              <div key={item.id || item.name} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                    <p className="mt-1 text-sm text-slate-400">{formatPercent(item.percentage)} attendance</p>
                  </div>
                  <span className={`rounded-full border border-slate-700 px-3 py-1 text-sm font-medium ${statusTone}`}>{status}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Present</p>
                    <p className="mt-1 text-xl font-semibold text-white">{item.attended}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Absent</p>
                    <p className="mt-1 text-xl font-semibold text-white">{Math.max(0, item.conducted - item.attended)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Remaining</p>
                    <p className="mt-1 text-xl font-semibold text-white">{item.remaining}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Safe bunks</p>
                    <p className="mt-1 text-xl font-semibold text-white">{safeBunks}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'subjects':
        return <SubjectManager subjects={data.subjects} onAdd={() => onSave({ ...data, subjects: [...(data.subjects || []), { id: crypto.randomUUID(), name: `Subject ${(data.subjects || []).length + 1}`, color: '#60a5fa' }] })} onUpdate={(subjectId, nextName) => onSave({ ...data, subjects: (data.subjects || []).map((subject) => (subject.id === subjectId ? { ...subject, name: nextName } : subject)) })} onDelete={(subjectId) => onSave({ ...data, subjects: (data.subjects || []).filter((subject) => subject.id !== subjectId) })} />;
      case 'timetable':
        return <TimetableBuilder timetable={data.timetable} subjects={data.subjects} onChange={(nextTimetable) => onSave({ ...data, timetable: nextTimetable })} />;
      case 'attendance':
        return (
          <div className="space-y-6">
            <div id="attendance" ref={attendanceSectionRef}>
              <TodayPage selectedDate={selectedDate} classes={selectedDayClasses} attendance={draftAttendance} onMarkAll={markAll} onMarkOne={markOne} onSave={saveAttendance} onClear={clearAttendance} onDeleteDate={deleteAttendanceForDate} />
            </div>
            <BunkPredictor summary={summary} subjects={data.subjects} threshold={data.settings?.attendanceThreshold ?? 75} />
          </div>
        );
      case 'calendar':
        return <CalendarView selectedDate={selectedDate} onSelectDate={handleSelectDate} attendanceRecords={data.attendance} />;
      case 'analytics':
        return <BunkPredictor summary={summary} subjects={data.subjects} threshold={data.settings?.attendanceThreshold ?? 75} />;
      case 'settings':
        return <SettingsPanel settings={data.settings} onChangeThreshold={handleThresholdChange} onExport={onExport} onImport={onImport} onReset={onReset} />;
      case 'history':
        return <AttendanceHistory attendanceRecords={data.attendance} onSelectDate={handleSelectDate} />;
      case 'bunk':
        return <BunkPredictor summary={summary} subjects={data.subjects} threshold={data.settings?.attendanceThreshold ?? 75} />;
      case 'leave':
        return <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">Leave planner view coming soon while preserving the existing attendance engine.</div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)] px-0 py-0 text-slate-100 lg:px-2 lg:py-2">
      <div className="mx-auto flex max-w-7xl gap-0 lg:gap-6">
        <SidebarNav activeView={activeView} onNavigate={handleNavigate} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-0 lg:py-6">
          <div className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-2xl shadow-slate-950/30 lg:hidden">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Portal</p>
              <h2 className="text-lg font-semibold text-white">Attendance Planner</h2>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">Menu</button>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
