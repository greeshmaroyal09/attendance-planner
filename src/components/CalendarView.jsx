import React, { useMemo, useState } from 'react';
import { academicCalendar } from '../data/academicCalendar';
import { getCalendarStats, getDateRange, getDateSchedule, isWorkingDay } from '../utils/calendar';

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getMonthKey(dateString) {
  return dateString.slice(0, 7);
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const safeDate = new Date(Date.UTC(year, month - 1, 1));
  return safeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
}

export default function CalendarView({ selectedDate, onSelectDate, attendanceRecords, dateRules = {} }) {
  const calendar = { ...academicCalendar, dateRules };
  const stats = getCalendarStats(calendar);
  const dates = useMemo(() => getDateRange(academicCalendar.startDate, academicCalendar.lastWorkingDay), []);
  const today = new Date().toISOString().split('T')[0];
  const [selectedMonth, setSelectedMonth] = useState(null);

  const monthCards = useMemo(() => {
    const months = [];
    const seen = new Set();

    dates.forEach((date) => {
      const monthKey = getMonthKey(date);
      if (!seen.has(monthKey)) {
        seen.add(monthKey);
        months.push({ key: monthKey, label: formatMonthLabel(monthKey) });
      }
    });

    return months;
  }, [dates]);

  const selectedMonthDates = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }

    return dates.filter((date) => getMonthKey(date) === selectedMonth);
  }, [dates, selectedMonth]);

  const selectedMonthGrid = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }

    const startOfMonth = new Date(`${selectedMonth}-01T00:00:00Z`);
    const leadingEmptyDays = startOfMonth.getUTCDay();
    const cells = Array.from({ length: leadingEmptyDays }, () => null);
    selectedMonthDates.forEach((date) => cells.push(date));

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [selectedMonth, selectedMonthDates]);

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

      {!selectedMonth ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {monthCards.map((month) => (
            <button
              key={month.key}
              type="button"
              onClick={() => setSelectedMonth(month.key)}
              className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-5 text-center text-lg font-semibold uppercase tracking-[0.12em] text-slate-100 transition hover:border-cyan-500 hover:bg-slate-900 shadow-lg shadow-slate-950/20"
            >
              {month.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedMonth(null)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Months</span>
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60">
            <div className="border-b border-slate-700 px-4 py-3 text-center">
              <h3 className="text-xl font-semibold uppercase tracking-[0.12em] text-white">{formatMonthLabel(selectedMonth)}</h3>
            </div>

            <div className="grid grid-cols-7 gap-1 border-b border-slate-700 bg-slate-900/70 p-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {WEEKDAY_LABELS.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 p-3">
              {selectedMonthGrid.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-20 rounded-xl border border-dashed border-slate-800 bg-slate-950/40" />;
                }

                const schedule = getDateSchedule(date, {}, calendar);
                const working = isWorkingDay(date, calendar);
                const hasAttendanceRecord = Boolean(attendanceRecords?.[date] && Object.keys(attendanceRecords[date]).length);
                const isExamDay = academicCalendar.midExams.includes(date) || academicCalendar.endExams.includes(date);
                const isHoliday = academicCalendar.holidays.includes(date) || academicCalendar.poojaHolidays.includes(date) || academicCalendar.deepavaliHolidays.includes(date) || academicCalendar.customHolidays?.includes(date);

                let badge = 'border-slate-700 bg-slate-800 text-slate-200';
                if (date === selectedDate) badge = 'border-cyan-500 bg-cyan-500/20 text-cyan-300';
                else if (date === today) badge = 'border-cyan-400 bg-cyan-500/20 text-cyan-300';
                else if (hasAttendanceRecord) badge = 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300';
                else if (schedule.status === 'no-class') badge = 'border-violet-500/60 bg-violet-500/20 text-violet-200';
                else if (schedule.status === 'half-day') badge = 'border-amber-500/60 bg-amber-500/20 text-amber-200';
                else if (isExamDay) badge = 'border-amber-500/60 bg-amber-500/20 text-amber-300';
                else if (isHoliday) badge = 'border-rose-500/60 bg-rose-500/20 text-rose-300';
                else if (working) badge = 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300';

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => onSelectDate(date)}
                    className={`flex h-20 flex-col items-start justify-between rounded-xl border p-2 text-left text-[10px] shadow-sm shadow-slate-950/20 transition hover:border-cyan-500 ${badge}`}
                  >
                    <span className="font-semibold">{new Date(`${date}T00:00:00Z`).getUTCDate()}</span>
                    <span className="text-[9px] uppercase tracking-[0.12em] opacity-80">
                      {schedule.status === 'no-class' ? 'No Class' : schedule.status === 'half-day' ? 'Half Day' : working ? 'Working' : 'Off'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
