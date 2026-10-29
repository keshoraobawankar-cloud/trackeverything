import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Heart,
  Clock,
  Zap,
  Footprints,
  Activity,
  Plus,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { WorkoutLog } from '../types';

interface WorkoutCalendarProps {
  workouts: WorkoutLog[];
  onAddWorkoutForDate?: (dateStr: string) => void;
}

export type ColorMode = 'intensity' | 'category';

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  workouts,
  onAddWorkoutForDate
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calendar View State: Year & Month
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [colorMode, setColorMode] = useState<ColorMode>('intensity');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });

  // Calculate days for the calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

    // Trailing days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(currentYear, currentMonth, day);
      const isoStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr: isoStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: isoStr === todayStr
      });
    }

    // Trailing padding days to fill 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const isoStr = nextDate.toISOString().split('T')[0];
      days.push({
        dateStr: isoStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Map workouts by date
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, WorkoutLog[]>();
    workouts.forEach((w) => {
      const existing = map.get(w.date) || [];
      map.set(w.date, [...existing, w]);
    });
    return map;
  }, [workouts]);

  // Monthly aggregate statistics
  const monthStats = useMemo(() => {
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const thisMonthWorkouts = workouts.filter((w) => w.date.startsWith(currentMonthKey));

    const totalMinutes = thisMonthWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);
    const totalCalories = thisMonthWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
    const avgHeartRate = thisMonthWorkouts.length
      ? Math.round(thisMonthWorkouts.reduce((acc, w) => acc + w.avgHeartRate, 0) / thisMonthWorkouts.length)
      : 0;

    const intensityCount = {
      Extreme: thisMonthWorkouts.filter((w) => w.intensity === 'Extreme').length,
      High: thisMonthWorkouts.filter((w) => w.intensity === 'High').length,
      Moderate: thisMonthWorkouts.filter((w) => w.intensity === 'Moderate').length,
      Low: thisMonthWorkouts.filter((w) => w.intensity === 'Low').length
    };

    const daysCount = new Set(thisMonthWorkouts.map((w) => w.date)).size;
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const consistencyRate = Math.round((daysCount / totalDaysInMonth) * 100);

    return {
      sessionsCount: thisMonthWorkouts.length,
      activeDaysCount: daysCount,
      totalHours: (totalMinutes / 60).toFixed(1),
      totalCalories,
      avgHeartRate,
      intensityCount,
      consistencyRate
    };
  }, [workouts, currentYear, currentMonth]);

  // Color-coding helpers
  const getIntensityColorClass = (dayWorkouts: WorkoutLog[]) => {
    if (!dayWorkouts.length) {
      return 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-700';
    }

    // Determine highest intensity among workouts for that day
    const hasExtreme = dayWorkouts.some((w) => w.intensity === 'Extreme' || w.durationMinutes >= 65);
    const hasHigh = dayWorkouts.some((w) => w.intensity === 'High' || w.durationMinutes >= 48);
    const hasModerate = dayWorkouts.some((w) => w.intensity === 'Moderate' || w.durationMinutes >= 35);

    if (hasExtreme) {
      return 'bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400 shadow-sm shadow-rose-500/10';
    }
    if (hasHigh) {
      return 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-400 shadow-sm shadow-amber-500/10';
    }
    if (hasModerate) {
      return 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40 hover:bg-indigo-500/30 hover:border-indigo-400 shadow-sm shadow-indigo-500/10';
    }
    return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400 shadow-sm shadow-emerald-500/10';
  };

  const getCategoryColorClass = (dayWorkouts: WorkoutLog[]) => {
    if (!dayWorkouts.length) {
      return 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-700';
    }
    const cat = dayWorkouts[0].category;
    switch (cat) {
      case 'Strength':
        return 'bg-purple-500/20 text-purple-200 border-purple-500/40 hover:bg-purple-500/30 hover:border-purple-400';
      case 'Cardio':
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400';
      case 'HIIT':
        return 'bg-orange-500/20 text-orange-200 border-orange-500/40 hover:bg-orange-500/30 hover:border-orange-400';
      case 'Mobility':
        return 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400';
      case 'Calisthenics':
        return 'bg-pink-500/20 text-pink-200 border-pink-500/40 hover:bg-pink-500/30 hover:border-pink-400';
      default:
        return 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40 hover:bg-indigo-500/30 hover:border-indigo-400';
    }
  };

  const getCategoryIcon = (cat: WorkoutLog['category']) => {
    switch (cat) {
      case 'Strength':
        return <Dumbbell className="w-3 h-3 text-purple-400 shrink-0" />;
      case 'Cardio':
        return <Footprints className="w-3 h-3 text-emerald-400 shrink-0" />;
      case 'HIIT':
        return <Flame className="w-3 h-3 text-orange-400 shrink-0" />;
      case 'Mobility':
        return <Activity className="w-3 h-3 text-cyan-400 shrink-0" />;
      case 'Calisthenics':
        return <Zap className="w-3 h-3 text-pink-400 shrink-0" />;
      default:
        return <Dumbbell className="w-3 h-3 text-indigo-400 shrink-0" />;
    }
  };

  // Selected date workouts
  const selectedDayWorkouts = workoutsByDate.get(selectedDateStr) || [];
  const selectedDateFormatted = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Calendar Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Workout Intensity Calendar
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Biometric Load
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual training heat map color-coded by exertion intensity, session duration, and workout domain
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Color Mode Toggle */}
          <div className="flex items-center bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setColorMode('intensity')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                colorMode === 'intensity'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Intensity & Time</span>
            </button>
            <button
              onClick={() => setColorMode('category')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                colorMode === 'category'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Workout Type</span>
            </button>
          </div>

          {/* Month Stepper & Today Button */}
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-zinc-200 font-mono min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-2 py-1 ml-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 my-4">
        <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-emerald-400" /> Total Workouts
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">{monthStats.sessionsCount}</span>
            <span className="text-[10px] text-zinc-500 font-mono">sessions</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" /> Training Volume
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-indigo-300">{monthStats.totalHours}</span>
            <span className="text-[10px] text-zinc-500 font-mono">hours</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Total Energy Burn
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-300">
              {monthStats.totalCalories.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">kcal</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400" /> Avg Heart Rate
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-rose-300">
              {monthStats.avgHeartRate > 0 ? `${monthStats.avgHeartRate} bpm` : '—'}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" /> Active Days
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-teal-300">
              {monthStats.activeDaysCount}d
            </span>
            <span className="text-[10px] font-mono text-teal-400/80">({monthStats.consistencyRate}%)</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Section (Grid + Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-zinc-950/50 rounded-xl border border-zinc-800/80 p-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dayWorkouts = workoutsByDate.get(day.dateStr) || [];
              const hasWorkouts = dayWorkouts.length > 0;
              const isSelected = day.dateStr === selectedDateStr;

              const colorClass =
                colorMode === 'intensity'
                  ? getIntensityColorClass(dayWorkouts)
                  : getCategoryColorClass(dayWorkouts);

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`min-h-[72px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all relative ${
                    day.isCurrentMonth ? colorClass : 'opacity-25 bg-zinc-950/20 border-zinc-900 text-zinc-600'
                  } ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20 z-10 scale-[1.02]'
                      : ''
                  } ${day.isToday ? 'border-dashed border-emerald-400/80' : ''}`}
                >
                  {/* Top Bar inside cell: Day number & Today indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected
                          ? 'text-white'
                          : day.isToday
                          ? 'text-emerald-400 underline underline-offset-2'
                          : hasWorkouts
                          ? 'text-zinc-100'
                          : 'text-zinc-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Today" />
                    )}
                  </div>

                  {/* Middle/Bottom: Workout indicators */}
                  {hasWorkouts ? (
                    <div className="space-y-1 w-full mt-1">
                      {dayWorkouts.slice(0, 1).map((w) => (
                        <div key={w.id} className="w-full">
                          <div className="flex items-center gap-1 text-[10px] font-medium truncate">
                            {getCategoryIcon(w.category)}
                            <span className="truncate hidden sm:inline">{w.title}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono mt-0.5 opacity-90">
                            <span className="font-bold">{w.durationMinutes}m</span>
                            <span className="text-[9px] opacity-80">{w.caloriesBurned}k</span>
                          </div>
                        </div>
                      ))}

                      {dayWorkouts.length > 1 && (
                        <div className="text-[9px] font-mono text-zinc-400 text-right">
                          +{dayWorkouts.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-600 font-mono italic opacity-60">Rest</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Color-Coded Legend */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <span className="text-zinc-400 font-mono uppercase text-[10px]">
              Legend ({colorMode === 'intensity' ? 'Intensity & Duration' : 'Category'}):
            </span>

            {colorMode === 'intensity' ? (
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/60" />
                  <span className="text-rose-300">Extreme (&gt;60m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/60" />
                  <span className="text-amber-300">High (46–60m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/60" />
                  <span className="text-indigo-300">Moderate (31–45m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/60" />
                  <span className="text-emerald-300">Low (≤30m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-zinc-900 border border-zinc-800" />
                  <span className="text-zinc-500">Rest</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/60" />
                  <span className="text-purple-300">Strength</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/60" />
                  <span className="text-emerald-300">Cardio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/60" />
                  <span className="text-orange-300">HIIT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/60" />
                  <span className="text-cyan-300">Mobility</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-pink-500/30 border border-pink-500/60" />
                  <span className="text-pink-300">Calisthenics</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Day Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950/70 rounded-xl border border-zinc-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Day Inspection</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedDateFormatted}</h3>
              </div>

              {selectedDateStr === todayStr && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Today
                </span>
              )}
            </div>

            {/* Workouts on this Day */}
            {selectedDayWorkouts.length > 0 ? (
              <div className="mt-4 space-y-3">
                {selectedDayWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(w.category)}
                        <h4 className="font-bold text-sm text-zinc-100">{w.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          w.intensity === 'Extreme'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : w.intensity === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : w.intensity === 'Moderate'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {w.intensity}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                      <div>
                        <span className="text-zinc-500 text-[9px] uppercase block">Duration</span>
                        <span className="font-bold text-zinc-200">{w.durationMinutes}m</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[9px] uppercase block">Burn</span>
                        <span className="font-bold text-amber-400">{w.caloriesBurned} kcal</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[9px] uppercase block">Peak HR</span>
                        <span className="font-bold text-rose-400">{w.peakHeartRate} bpm</span>
                      </div>
                    </div>

                    {w.exercises && w.exercises.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800/70">
                        <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">
                          Movements & Loads:
                        </span>
                        <ul className="text-xs text-zinc-300 space-y-1">
                          {w.exercises.map((ex, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 text-center py-6 px-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                  <Activity className="w-5 h-5 text-zinc-500" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-300">Active Recovery / Rest Day</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  No intense resistance or cardiovascular training logged. Prioritize hydration, sleep, and myofascial mobility.
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Button for Selected Day */}
          <div className="mt-5 pt-3 border-t border-zinc-800">
            <button
              onClick={() => onAddWorkoutForDate && onAddWorkoutForDate(selectedDateStr)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout for {selectedDateStr}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
