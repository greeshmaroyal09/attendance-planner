import React from 'react';
import { academicCalendar } from '../data/academicCalendar';
import { getCalendarStats, getDateRange, isWorkingDay } from '../utils/calendar';

export default function CalendarView({ selectedDate, onSelectDate, attendanceRecords }) {
  const stats = getCalendarStats();
  const dates = getDateRange(academicCalendar.startDate, academicCalendar.lastWorkingDay);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-emerald-500/20 px-2 py-1">Working: {stats.workingDaysCount}</span>
          <span className="rounded-full bg-rose-500/20 px-2 py-1">Holiday: {stats.holidayCount}</span>
          <span className="rounded-full bg-sky-500/20 px-2 py-1">Pooja: {stats.poojaHolidayCount}</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-1">Deepavali: {stats.deepavaliHolidayCount}</span>
        </div>
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {dates.map((date) => {
          const working = isWorkingDay(date);
          const hasAttendanceRecord = Boolean(attendanceRecords?.[date] && Object.keys(attendanceRecords[date]).length);
          let badge = 'bg-slate-800';
          if (date === selectedDate) badge = 'border-cyan-500 bg-cyan-500/20 text-cyan-300';
          else if (date === new Date().toISOString().split('T')[0]) badge = 'bg-cyan-500/20 text-cyan-300';
          else if (hasAttendanceRecord) badge = 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300';
          else if (academicCalendar.holidays.includes(date)) badge = 'bg-rose-500/20 text-rose-300';
          else if (academicCalendar.poojaHolidays.includes(date)) badge = 'bg-sky-500/20 text-sky-300';
          else if (academicCalendar.deepavaliHolidays.includes(date)) badge = 'bg-amber-500/20 text-amber-300';
          else if (working) badge = 'bg-emerald-500/20 text-emerald-300';

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`rounded-xl border border-slate-800 p-2 text-left text-xs sm:text-sm ${badge}`}
            >
              <div className="font-medium">{date}</div>
              <div className="text-xs opacity-80">{working ? 'Working Day' : 'Off'}</div>
              {hasAttendanceRecord && <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Saved</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
