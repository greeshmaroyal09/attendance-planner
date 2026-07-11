import React from 'react';
import { academicCalendar } from '../data/academicCalendar';
import { getCalendarStats, getDateRange, isWorkingDay } from '../utils/calendar';

export default function CalendarView({ selectedDate, onSelectDate, attendanceRecords }) {
  const stats = getCalendarStats();
  const dates = getDateRange(academicCalendar.startDate, academicCalendar.lastWorkingDay);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Academic Calendar</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Calendar</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-emerald-500/20 px-2 py-1">Working: {stats.workingDaysCount}</span>
          <span className="rounded-full bg-rose-500/20 px-2 py-1">Holiday: {stats.holidayCount}</span>
          <span className="rounded-full bg-sky-500/20 px-2 py-1">Pooja: {stats.poojaHolidayCount}</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-1">Deepavali: {stats.deepavaliHolidayCount}</span>
          <span className="rounded-full bg-violet-500/20 px-2 py-1">Custom: {stats.customHolidayCount}</span>
        </div>
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {dates.map((date) => {
          const working = isWorkingDay(date);
          const hasAttendanceRecord = Boolean(attendanceRecords?.[date] && Object.keys(attendanceRecords[date]).length);
          const isExamDay = academicCalendar.midExams.includes(date) || academicCalendar.endExams.includes(date);
          const isHoliday = academicCalendar.holidays.includes(date) || academicCalendar.poojaHolidays.includes(date) || academicCalendar.deepavaliHolidays.includes(date) || academicCalendar.customHolidays?.includes(date);
          let badge = 'bg-slate-800';
          if (date === selectedDate) badge = 'border-cyan-500 bg-cyan-500/20 text-cyan-300';
          else if (date === today) badge = 'border-cyan-400 bg-cyan-500/20 text-cyan-300';
          else if (hasAttendanceRecord) badge = 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300';
          else if (isExamDay) badge = 'border-amber-500/60 bg-amber-500/20 text-amber-300';
          else if (isHoliday) badge = 'bg-rose-500/20 text-rose-300';
          else if (working) badge = 'bg-emerald-500/20 text-emerald-300';

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`rounded-2xl border border-slate-800 p-2 text-left text-xs shadow-sm shadow-slate-950/20 sm:text-sm ${badge}`}
            >
              <div className="font-medium">{date}</div>
              <div className="text-xs opacity-80">{working ? 'Working Day' : 'Off'}</div>
              {hasAttendanceRecord && <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Saved</div>}
              {isExamDay && <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">Exam</div>}
              {isHoliday && !isExamDay && <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-300">Holiday</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
