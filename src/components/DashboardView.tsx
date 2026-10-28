import React from 'react';
import {
  Flame,
  Activity,
  DollarSign,
  Clock,
  Eye,
  Video,
  ArrowRight,
  TrendingUp,
  Heart,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import {
  Habit,
  FitnessProfile,
  WorkoutLog,
  Transaction,
  Subscription,
  StudyTask,
  ReelPost,
  PostureSessionStats
} from '../types';

interface DashboardViewProps {
  habits: Habit[];
  onToggleHabitToday: (id: string) => void;
  fitnessProfile: FitnessProfile;
  recentWorkouts: WorkoutLog[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  studyTasks: StudyTask[];
  reelPosts: ReelPost[];
  postureStats: PostureSessionStats;
  onNavigate: (tab: string) => void;
  onStartDeepWork: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  habits,
  onToggleHabitToday,
  fitnessProfile,
  recentWorkouts,
  transactions,
  subscriptions,
  studyTasks,
  reelPosts,
  postureStats,
  onNavigate,
  onStartDeepWork
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Habit metrics
  const completedTodayCount = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);

  // Financial calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Upcoming subscription renewal (next 7 days)
  const currentDayOfMonth = new Date().getDate();
  const upcomingSubs = subscriptions
    .filter(s => s.active)
    .map(s => {
      let daysUntil = s.renewalDayOfMonth - currentDayOfMonth;
      if (daysUntil < 0) daysUntil += 30;
      return { ...s, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const nextSub = upcomingSubs[0];

  // Morning priority tasks
  const morningTasks = studyTasks.filter(t => t.isMorningPriority);
  const morningCompleted = morningTasks.filter(t => t.completed).length;

  // Reel stats
  const totalReelViews = reelPosts.reduce((acc, r) => acc + r.views, 0);
  const scheduledCount = reelPosts.filter(r => r.status === 'Scheduled').length;

  // BMI calculation
  const bmiVal = parseFloat((fitnessProfile.weightKg / Math.pow(fitnessProfile.heightCm / 100, 2)).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Top Hero Banner: Cognitive Readiness & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-indigo-950/40 border border-zinc-800/80 p-6 lg:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Cognitive Prime Window
              </span>
              <span className="text-xs text-zinc-400">
                Morning focus prioritized for peak neurotransmitter efficiency
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Daily Master Control Center
            </h1>
            <p className="text-sm text-zinc-300 mt-1 max-w-xl">
              All systems synchronized: habits, heart rate & calories, cashflow, deep work intervals, posture alerts, and social creator channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartDeepWork}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Launch 50m Deep Work</span>
            </button>
            <button
              onClick={() => onNavigate('fitness')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm border border-zinc-700/80 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Log Biometrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Habit Streak Rate */}
        <div
          onClick={() => onNavigate('habits')}
          className="cursor-pointer group p-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Habit Completion</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{completedTodayCount}/{habits.length}</span>
            <span className="text-xs font-mono text-orange-400 font-medium">{habitCompletionRate}% Today</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${habitCompletionRate}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Peak streak: {maxStreak} days</span>
            <span className="group-hover:text-zinc-200 flex items-center gap-0.5">Manage <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* Metric 2: Fitness & Calorie Burn */}
        <div
          onClick={() => onNavigate('fitness')}
          className="cursor-pointer group p-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Biometrics</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{fitnessProfile.todaySteps.toLocaleString()}</span>
            <span className="text-xs text-zinc-400">/ {fitnessProfile.dailyStepsTarget.toLocaleString()} steps</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((fitnessProfile.todaySteps / fitnessProfile.dailyStepsTarget) * 100))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> {fitnessProfile.todayActiveHeartRate} bpm</span>
            <span className="font-mono text-emerald-400 font-medium">{fitnessProfile.todayCaloriesBurned} kcal</span>
          </div>
        </div>

        {/* Metric 3: Financial Cashflow */}
        <div
          onClick={() => onNavigate('finance')}
          className="cursor-pointer group p-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Net Monthly Cashflow</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">+${netSavings.toLocaleString()}</span>
            <span className="text-xs font-mono text-cyan-400 font-medium">{savingsRate}% saved</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Income: ${totalIncome.toLocaleString()}</span>
            <span>Expenses: ${totalExpense.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 4: Creator Reach & Reels */}
        <div
          onClick={() => onNavigate('reels')}
          className="cursor-pointer group p-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Social Reel Reach</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{(totalReelViews / 1000).toFixed(1)}k</span>
            <span className="text-xs text-violet-400 font-medium">Total Views</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>{scheduledCount} queued for release</span>
            <span className="group-hover:text-zinc-200 flex items-center gap-0.5">Open Studio <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Habits Checklist & Morning Focus Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Active Habits */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                Today's Core Discipline Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">One-click streak validation for instant habit anchoring</p>
            </div>
            <button
              onClick={() => onNavigate('habits')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Full Heatmap <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60 mt-2">
            {habits.map((habit) => {
              const isDone = habit.completedDates.includes(todayStr);
              return (
                <div
                  key={habit.id}
                  className="py-3 flex items-center justify-between group hover:bg-zinc-800/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleHabitToday(habit.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 scale-105'
                          : 'border border-zinc-700 hover:border-zinc-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className={`text-sm font-medium ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {habit.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-500">Reminder: {habit.reminderTime}</span>
                        <span>•</span>
                        <span className="font-mono text-orange-400">{habit.streak}d streak</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
                    {habit.targetCount} {habit.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Morning Priority Tasks & Deep Work */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Morning Priority Planner
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">High-friction cognitive tasks scheduled first</p>
              </div>
              <span className="text-xs font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {morningCompleted}/{morningTasks.length} Done
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {morningTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    task.completed
                      ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                      : 'bg-zinc-800/50 border-zinc-700/70 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono text-indigo-400">{task.timeSlot}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                      {task.durationMinutes}m
                    </span>
                  </div>
                  <div className={`text-sm font-medium mt-1 ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                    {task.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>{task.subject}</span>
                    <span>•</span>
                    <span className="text-rose-400">{task.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate('study')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium"
            >
              Day Schedule & Break Heuristics <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigate('study')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Generate AI Plan
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Subscription & Posture / Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Subscription Renewal Alert */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Upcoming Renewal Reminder
            </span>
            <button
              onClick={() => onNavigate('finance')}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              All Subs
            </button>
          </div>

          {nextSub ? (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{nextSub.serviceName}</span>
                <span className="text-sm font-mono font-bold text-cyan-400">${nextSub.amount}/{nextSub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Renews on Day {nextSub.renewalDayOfMonth} ({nextSub.daysUntil === 0 ? 'Today!' : `in ${nextSub.daysUntil} days`})
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs text-cyan-200">
                  Recurring budget impact: ${(subscriptions.reduce((acc, s) => acc + s.amount, 0)).toFixed(2)}/mo
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs text-zinc-500">No active subscriptions configured.</div>
          )}
        </div>

        {/* Card 2: Posture & Movement Monitor Snapshot */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Real-Time Ergonomic Health
            </span>
            <button
              onClick={() => onNavigate('posture')}
              className="text-[11px] text-indigo-400 hover:underline"
            >
              Monitor
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400">Current Alignment</span>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {postureStats.currentPostureStatus}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400">Focus Score</span>
              <div className="text-base font-mono font-bold text-white mt-0.5">
                {postureStats.focusScore}%
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
              <span className="text-zinc-400 text-[10px] uppercase block">Micromovements</span>
              <span className="text-sm font-bold text-zinc-200">{postureStats.micromovements}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
              <span className="text-zinc-400 text-[10px] uppercase block">Slouch Flags</span>
              <span className="text-sm font-bold text-amber-400">{postureStats.slouchWarnings}</span>
            </div>
          </div>
        </div>

        {/* Card 3: BMI & Body Metrics Snapshot */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              BMI & Body Type Baseline
            </span>
            <button
              onClick={() => onNavigate('fitness')}
              className="text-[11px] text-emerald-400 hover:underline"
            >
              AI Protocol
            </button>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">{bmiVal}</span>
              <span className="text-xs text-zinc-400 ml-1.5 font-medium">BMI (Normal)</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {fitnessProfile.bodyType}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-2">
            Target: {fitnessProfile.goal}. Recommended daily protein: ~{Math.round(fitnessProfile.weightKg * 2.0)}g.
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60 font-mono">
            <span>Weight: {fitnessProfile.weightKg} kg</span>
            <span>Height: {fitnessProfile.heightCm} cm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
