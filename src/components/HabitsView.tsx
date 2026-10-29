import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Bell,
  Check,
  Calendar,
  Trash2,
  TrendingUp,
  Award,
  Sparkles,
  Download,
  FileSpreadsheet,
  Filter,
  Search,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit, HabitCategory } from '../types';

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'history'>) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleHabitDate,
  onAddHabit,
  onDeleteHabit
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('Health');
  const [newHabitTarget, setNewHabitTarget] = useState(1);
  const [newHabitUnit, setNewHabitUnit] = useState('times');
  const [newHabitReminder, setNewHabitReminder] = useState('08:00');
  const [newHabitColor, setNewHabitColor] = useState('#818cf8');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generate last 7 days list for quick tracker table
  const days: { dateStr: string; label: string; dayNum: number; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      dateStr,
      label: dayName,
      dayNum: d.getDate(),
      isToday: i === 0
    });
  }

  // Generate last 28 days for visual activity heat grid
  const past28Days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    past28Days.push(d.toISOString().split('T')[0]);
  }

  const handleToggle = (habitId: string, dateStr: string, isDone: boolean) => {
    onToggleHabitDate(habitId, dateStr);
    if (!isDone) {
      // Confetti burst on completion!
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      });
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit({
      name: newHabitName.trim(),
      category: newHabitCategory,
      frequency: 'daily',
      reminderTime: newHabitReminder,
      targetCount: newHabitTarget,
      unit: newHabitUnit,
      color: newHabitColor
    });
    setNewHabitName('');
    setShowAddModal(false);
  };

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const bestOverallStreak = Math.max(...habits.map(h => h.bestStreak), 0);

  // Categories for filtering: Health, Work, Personal, plus any existing habit categories
  const defaultCategories: string[] = ['Health', 'Work', 'Personal'];
  const habitCategories = habits.map(h => h.category).filter(Boolean);
  const allCategories = Array.from(new Set([...defaultCategories, ...habitCategories]));
  const filterCategories = ['All', ...allCategories];

  const filteredHabits = habits.filter((h) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (h.category || '').toLowerCase() === selectedCategory.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      h.name.toLowerCase().includes(query) ||
      (h.category && h.category.toLowerCase().includes(query)) ||
      (h.unit && h.unit.toLowerCase().includes(query)) ||
      (h.reminderTime && h.reminderTime.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const [exportedToast, setExportedToast] = useState(false);

  const handleExportCSV = () => {
    const escapeCSV = (val: string | number | undefined | null) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes(';')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    // Header for Summary Section
    const summaryHeaders = [
      'Habit ID',
      'Habit Name',
      'Category',
      'Target Count',
      'Target Unit',
      'Current Streak (Days)',
      'Best Streak (Days)',
      'Reminder Time',
      'Total Check-Ins',
      'Completed Dates'
    ];

    const summaryRows = habits.map(h => [
      escapeCSV(h.id),
      escapeCSV(h.name),
      escapeCSV(h.category),
      escapeCSV(h.targetCount),
      escapeCSV(h.unit),
      escapeCSV(h.streak),
      escapeCSV(h.bestStreak),
      escapeCSV(h.reminderTime),
      escapeCSV(h.completedDates.length),
      escapeCSV(h.completedDates.join('; '))
    ]);

    // Chronological logs section
    const chronologicalRows: { date: string; id: string; name: string; category: string }[] = [];
    habits.forEach(h => {
      h.completedDates.forEach(date => {
        chronologicalRows.push({
          date,
          id: h.id,
          name: h.name,
          category: h.category
        });
      });
    });

    chronologicalRows.sort((a, b) => b.date.localeCompare(a.date));

    const csvLines = [
      '# ApexLife Habit Tracker & Streak Analytics Export',
      `# Export Timestamp: ${new Date().toISOString()}`,
      `# Total Active Habits: ${habits.length}`,
      `# Total Lifetime Check-Ins: ${totalCompletions}`,
      '',
      '=== HABIT SUMMARY & CURRENT STREAKS ===',
      summaryHeaders.join(','),
      ...summaryRows.map(r => r.join(',')),
      '',
      '=== CHRONOLOGICAL COMPLETION HISTORY ===',
      'Date,Habit ID,Habit Name,Category,Status',
      ...chronologicalRows.map(log =>
        [escapeCSV(log.date), escapeCSV(log.id), escapeCSV(log.name), escapeCSV(log.category), 'Completed'].join(',')
      )
    ];

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `ApexLife_Habits_Streak_History_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            Habit Mastery & Streak Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build unshakeable neuro-habits with reminder schedules, active streaks, and 30-day heatmap data visualization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            aria-label="Export to CSV"
            title="Download complete habit streaks and completion history as CSV"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-700/80 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{exportedToast ? 'Exported to CSV!' : 'Export to CSV'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Habit</span>
          </button>
        </div>
      </div>

      {/* Top Streak Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
            <Flame className="w-6 h-6 fill-orange-500/30" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Longest Active Streak</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {bestOverallStreak} <span className="text-xs text-orange-400 font-sans font-normal">days</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Total Check-Ins Logged</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {totalCompletions} <span className="text-xs text-indigo-400 font-sans font-normal">reps</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Active Discipline Protocols</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {habits.length} <span className="text-xs text-emerald-400 font-sans font-normal">habits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Tracker Matrix Table */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">7-Day Completion Matrix</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Click any day circle to log or verify completion</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Week of {days[0].dateStr} - {days[6].dateStr}</span>
        </div>

        {/* Category Filter Pills and Search */}
        <div className="px-4 sm:px-5 py-3 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Real-time Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              Category:
            </span>
            {filterCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              const count = cat === 'All'
                ? habits.length
                : habits.filter((h) => (h.category || '').toLowerCase() === cat.toLowerCase()).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-zinc-400">
            Showing {filteredHabits.length} of {habits.length} habits
            {searchQuery && <span className="text-indigo-400 ml-1">matching "{searchQuery}"</span>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-medium text-zinc-400">
                <th className="py-3 px-4 sm:px-6 w-1/3">Habit Details</th>
                <th className="py-3 px-3 text-center">Reminder</th>
                <th className="py-3 px-3 text-center">Streak</th>
                {days.map((day) => (
                  <th key={day.dateStr} className={`py-3 px-2 text-center font-mono ${day.isToday ? 'text-indigo-400 font-bold' : ''}`}>
                    <div className="text-[11px] uppercase">{day.label}</div>
                    <div className="text-xs">{day.dayNum}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {filteredHabits.length === 0 ? (
                <tr>
                  <td colSpan={5 + days.length} className="py-12 px-4 text-center">
                    {searchQuery ? (
                      <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    ) : (
                      <Filter className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    )}
                    <div className="text-sm font-semibold text-zinc-300">
                      {searchQuery
                        ? `No habits matching "${searchQuery}"`
                        : `No habits found in category "${selectedCategory}"`}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? 'Try checking for spelling or searching by category, reminder time, or unit.'
                        : `Switch to "All" or create a new habit tagged under ${selectedCategory}.`}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3.5">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors"
                        >
                          Clear Search
                        </button>
                      )}
                      {selectedCategory !== 'All' && (
                        <button
                          onClick={() => setSelectedCategory('All')}
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium border border-zinc-700 transition-colors"
                        >
                          Show All Categories
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHabits.map((habit) => (
                  <tr key={habit.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <div>
                          <div className="font-semibold text-zinc-200 flex items-center gap-2">
                            <span>{habit.name}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                              {habit.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            Target: {habit.targetCount} {habit.unit}
                          </div>
                        </div>
                      </div>
                    </td>

                  {/* Reminder Time */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
                      <Bell className="w-3 h-3 text-indigo-400" />
                      {habit.reminderTime}
                    </span>
                  </td>

                  {/* Streak */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      {habit.streak}d
                    </span>
                  </td>

                  {/* 7-Day Matrix Checkboxes */}
                  {days.map((day) => {
                    const isDone = habit.completedDates.includes(day.dateStr);
                    return (
                      <td key={day.dateStr} className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => handleToggle(habit.id, day.dateStr, isDone)}
                          title={`${habit.name} on ${day.dateStr}`}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 hover:bg-emerald-600 scale-105'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>
                    );
                  })}

                  {/* Action Delete */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 28-Day Consistency Heatmap Grid */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              28-Day Heatmap & Habit Consistency Density
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Visual representation of daily habit frequency</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-zinc-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-950" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5">
          {past28Days.map((dateStr) => {
            const countForDay = habits.filter(h => h.completedDates.includes(dateStr)).length;
            const intensityClass =
              countForDay === 0
                ? 'bg-zinc-800/80 border-zinc-700/40'
                : countForDay <= 2
                ? 'bg-emerald-950 border-emerald-800/40 text-emerald-400'
                : countForDay <= 4
                ? 'bg-emerald-700 border-emerald-600/50 text-emerald-100'
                : 'bg-emerald-500 border-emerald-400 text-white font-bold';

            return (
              <div
                key={dateStr}
                title={`${dateStr}: ${countForDay} habits completed`}
                className={`aspect-square rounded-md border flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-110 cursor-pointer ${intensityClass}`}
              >
                {countForDay > 0 ? countForDay : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create New Habit</h3>
            <p className="text-xs text-zinc-400 mb-4">Set clear triggers, targets, and reminder cues.</p>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning 20-Page Reading"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Health">Health</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Study">Study</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Reminder Time</label>
                  <input
                    type="time"
                    value={newHabitReminder}
                    onChange={(e) => setNewHabitReminder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Target Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newHabitUnit}
                    onChange={(e) => setNewHabitUnit(e.target.value)}
                    placeholder="e.g. pages, mins, reps"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5">Color Accent</label>
                <div className="flex items-center gap-2">
                  {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewHabitColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${newHabitColor === col ? 'scale-110 border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
