import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Flame,
  Footprints,
  Dumbbell,
  Calculator,
  FileText,
  Sparkles,
  TrendingUp,
  Plus,
  ShieldCheck,
  CheckCircle,
  Download,
  Printer,
  Zap,
  Target,
  Award,
  Clock,
  Settings2,
  Trash2,
  RotateCcw,
  Check,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { FitnessProfile, WorkoutLog, BmiRecord, WorkoutGoal } from '../types';
import { ApiService } from '../services/api';
import { DEFAULT_WORKOUT_GOALS } from '../services/storage';
import { WorkoutCalendar } from './WorkoutCalendar';

const intensityToScore = (intensity: WorkoutLog['intensity']): number => {
  switch (intensity) {
    case 'Extreme':
      return 4;
    case 'High':
      return 3;
    case 'Moderate':
      return 2;
    case 'Low':
      return 1;
    default:
      return 2;
  }
};

const scoreToIntensityLabel = (score: number): string => {
  if (score >= 3.5) return 'Extreme';
  if (score >= 2.5) return 'High';
  if (score >= 1.5) return 'Moderate';
  if (score > 0) return 'Low';
  return 'None';
};

const CustomIntensityTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.hasWorkout) {
      return (
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-2xl text-xs text-zinc-300 font-sans">
          <div className="font-mono text-zinc-400 mb-1 font-semibold">{data.displayDate} ({data.date})</div>
          <div className="text-zinc-500 italic">Rest / Recovery Day (No sessions logged)</div>
        </div>
      );
    }

    const intensityColor =
      data.intensity >= 3.5
        ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
        : data.intensity >= 2.5
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        : data.intensity >= 1.5
        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

    return (
      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700/90 shadow-2xl text-xs text-zinc-200 font-sans min-w-[220px]">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5 mb-2 font-mono">
          <span className="text-zinc-300 font-bold">{data.displayDate}</span>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${intensityColor}`}>
            {scoreToIntensityLabel(data.intensity)} ({data.intensity})
          </span>
        </div>
        <div className="space-y-1.5">
          {data.workoutTitles.map((title: string, i: number) => (
            <div key={i} className="font-semibold text-white flex items-center gap-1.5">
              <span className="text-emerald-400 text-xs shrink-0">•</span>
              <span className="truncate max-w-[210px]">{title}</span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Duration: {data.totalDuration}m</span>
            <span className="text-orange-400">{data.totalCalories} kcal</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface FitnessViewProps {
  profile: FitnessProfile;
  workouts: WorkoutLog[];
  bmiRecords: BmiRecord[];
  onUpdateProfile: (profile: FitnessProfile) => void;
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  onAddBmiRecord: (record: Omit<BmiRecord, 'id'>) => void;
}

export const FitnessView: React.FC<FitnessViewProps> = ({
  profile,
  workouts,
  bmiRecords,
  onUpdateProfile,
  onAddWorkout,
  onAddBmiRecord
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Workout log modal state
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutDate, setWorkoutDate] = useState<string>(todayStr);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutCategory, setWorkoutCategory] = useState<WorkoutLog['category']>('Strength');
  const [workoutIntensity, setWorkoutIntensity] = useState<WorkoutLog['intensity']>('High');
  const [workoutDuration, setWorkoutDuration] = useState(50);
  const [workoutCalories, setWorkoutCalories] = useState(480);
  const [workoutAvgHr, setWorkoutAvgHr] = useState(136);
  const [workoutPeakHr, setWorkoutPeakHr] = useState(168);
  const [workoutExercises, setWorkoutExercises] = useState('Incline DB Press (4x8), DB Lat Raises (4x15), Tricep Dips (3x10)');

  // BMI Calculator inputs
  const [calcWeight, setCalcWeight] = useState(profile.weightKg);
  const [calcHeight, setCalcHeight] = useState(profile.heightCm);
  const [calcAge, setCalcAge] = useState(profile.age);
  const [calcBodyType, setCalcBodyType] = useState(profile.bodyType);
  const [calcGoal, setCalcGoal] = useState(profile.goal);

  // AI Protocol loading
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProtocol, setAiProtocol] = useState<any>(profile.aiProtocol || null);

  // Monthly Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCsv = () => {
    if (!workouts || workouts.length === 0) {
      setExportNotice('No workout logs found to export. Log a workout session first!');
      setTimeout(() => setExportNotice(null), 4000);
      return;
    }

    const headers = [
      'Date',
      'Workout Name',
      'Category',
      'Intensity',
      'Duration (Minutes)',
      'Calories Burned (kcal)',
      'Avg Heart Rate (BPM)',
      'Peak Heart Rate (BPM)',
      'Exercises'
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = workouts.map((w) => [
      escapeCsv(w.date),
      escapeCsv(w.title),
      escapeCsv(w.category),
      escapeCsv(w.intensity),
      escapeCsv(w.durationMinutes),
      escapeCsv(w.caloriesBurned),
      escapeCsv(w.avgHeartRate),
      escapeCsv(w.peakHeartRate),
      escapeCsv(Array.isArray(w.exercises) ? w.exercises.join('; ') : '')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workout_logs_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Successfully exported ${workouts.length} workout ${workouts.length === 1 ? 'log' : 'logs'} to CSV!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Current computed BMI
  const currentBmi = parseFloat((calcWeight / Math.pow(calcHeight / 100, 2)).toFixed(1));
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400', desc: 'Caloric surplus and resistance loading needed' };
    if (bmi < 24.9) return { label: 'Normal Weight (Optimal)', color: 'text-emerald-400', desc: 'Prime cardiovascular and metabolic baseline' };
    if (bmi < 29.9) return { label: 'Overweight', color: 'text-orange-400', desc: 'Targeted caloric deficit & lean preservation' };
    return { label: 'Obese', color: 'text-rose-400', desc: 'Low-impact zone 2 & clinical pacing' };
  };

  const bmiMeta = getBmiCategory(currentBmi);

  // Quick Protein rule of thumb
  const proteinPerKg = calcGoal.includes('Fat Loss') ? 2.2 : 2.0;
  const recommendedDailyProtein = Math.round(calcWeight * proteinPerKg);

  const handleSaveBmi = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    onAddBmiRecord({
      date: todayStr,
      weightKg: calcWeight,
      heightCm: calcHeight,
      bmi: currentBmi,
      bodyFatPct: 14.5,
      notes: `Target: ${calcGoal} (${calcBodyType})`
    });
    onUpdateProfile({
      ...profile,
      weightKg: calcWeight,
      heightCm: calcHeight,
      bodyType: calcBodyType,
      goal: calcGoal,
      age: calcAge
    });
  };

  const handleOpenModalForDate = (dateStr: string) => {
    setWorkoutDate(dateStr);
    setShowWorkoutModal(true);
  };

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle.trim()) return;
    onAddWorkout({
      date: workoutDate || todayStr,
      title: workoutTitle.trim(),
      category: workoutCategory,
      intensity: workoutIntensity,
      durationMinutes: workoutDuration,
      caloriesBurned: workoutCalories,
      avgHeartRate: workoutAvgHr,
      peakHeartRate: workoutPeakHr,
      exercises: workoutExercises.split(',').map(s => s.trim()).filter(Boolean)
    });
    // Also update today's active calories in profile if workout is for today
    if ((workoutDate || todayStr) === todayStr) {
      onUpdateProfile({
        ...profile,
        todayCaloriesBurned: profile.todayCaloriesBurned + workoutCalories
      });
    }
    setShowWorkoutModal(false);
    setWorkoutTitle('');
  };

  const handleGenerateAiFitness = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await ApiService.getFitnessRecommendation({
        weightKg: calcWeight,
        heightCm: calcHeight,
        age: calcAge,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        bodyType: calcBodyType,
        goal: calcGoal,
        weeklyDays: 4
      });
      setAiProtocol(result);
      onUpdateProfile({
        ...profile,
        aiProtocol: result
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 30-Day Workout Intensity Data for Recharts Line Chart
  const intensityChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const dayWorkouts = workouts.filter((w) => w.date === dateStr);
      if (dayWorkouts.length > 0) {
        const avgScore =
          dayWorkouts.reduce((acc, curr) => acc + intensityToScore(curr.intensity), 0) /
          dayWorkouts.length;
        const totalDuration = dayWorkouts.reduce((acc, curr) => acc + curr.durationMinutes, 0);
        const totalCalories = dayWorkouts.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
        data.push({
          date: dateStr,
          displayDate,
          intensity: parseFloat(avgScore.toFixed(1)),
          hasWorkout: true,
          totalDuration,
          totalCalories,
          workoutTitles: dayWorkouts.map((w) => w.title)
        });
      } else {
        data.push({
          date: dateStr,
          displayDate,
          intensity: 0,
          hasWorkout: false,
          totalDuration: 0,
          totalCalories: 0,
          workoutTitles: []
        });
      }
    }
    return data;
  }, [workouts]);

  // Workout Goals State & Configuration
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalTimeframe, setGoalTimeframe] = useState<'current-week' | 'rolling-7'>('current-week');
  const [editingGoals, setEditingGoals] = useState<WorkoutGoal[]>([]);
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalDuration, setNewGoalDuration] = useState(60);

  const activeGoals: WorkoutGoal[] = useMemo(() => {
    if (profile.workoutGoals && Array.isArray(profile.workoutGoals) && profile.workoutGoals.length > 0) {
      return profile.workoutGoals;
    }
    return DEFAULT_WORKOUT_GOALS;
  }, [profile.workoutGoals]);

  // Compute start/end dates for target tracking
  const targetDateRange = useMemo(() => {
    const now = new Date();
    if (goalTimeframe === 'rolling-7') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const startStr = start.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
      return {
        startStr,
        endStr,
        label: `Last 7 Days (${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – Today)`
      };
    } else {
      // Monday to Sunday of current week
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];
      return {
        startStr,
        endStr,
        label: `This Week (${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`
      };
    }
  }, [goalTimeframe]);

  // Aggregate logged minutes by category in the selected timeframe
  const weeklyCategoryDurations = useMemo(() => {
    const durationMap: Record<string, { totalMinutes: number; count: number; calories: number }> = {};
    const filtered = workouts.filter((w) => w.date >= targetDateRange.startStr && w.date <= targetDateRange.endStr);

    for (const w of filtered) {
      const cat = w.category || 'Other';
      if (!durationMap[cat]) {
        durationMap[cat] = { totalMinutes: 0, count: 0, calories: 0 };
      }
      durationMap[cat].totalMinutes += w.durationMinutes || 0;
      durationMap[cat].count += 1;
      durationMap[cat].calories += w.caloriesBurned || 0;
    }
    return durationMap;
  }, [workouts, targetDateRange]);

  // Goals progress items
  const goalProgressItems = useMemo(() => {
    return activeGoals.map((goal) => {
      const key = Object.keys(weeklyCategoryDurations).find(
        (k) => k.toLowerCase() === goal.category.toLowerCase()
      );
      const stats = key ? weeklyCategoryDurations[key] : { totalMinutes: 0, count: 0, calories: 0 };
      const actualMinutes = stats.totalMinutes;
      const pct = goal.targetMinutes > 0 ? Math.round((actualMinutes / goal.targetMinutes) * 100) : 0;
      const remainingMinutes = Math.max(0, goal.targetMinutes - actualMinutes);
      const isCompleted = actualMinutes >= goal.targetMinutes;

      return {
        ...goal,
        actualMinutes,
        pct,
        remainingMinutes,
        isCompleted,
        sessionsCount: stats.count,
        calories: stats.calories
      };
    });
  }, [activeGoals, weeklyCategoryDurations]);

  const totalWeeklyTargetMinutes = goalProgressItems.reduce((acc, g) => acc + g.targetMinutes, 0);
  const totalWeeklyLoggedMinutes = goalProgressItems.reduce((acc, g) => acc + g.actualMinutes, 0);
  const totalCompletedGoals = goalProgressItems.filter((g) => g.isCompleted).length;
  const overallWeeklyPct =
    totalWeeklyTargetMinutes > 0 ? Math.round((totalWeeklyLoggedMinutes / totalWeeklyTargetMinutes) * 100) : 0;

  const handleOpenGoalsModal = () => {
    setEditingGoals(JSON.parse(JSON.stringify(activeGoals)));
    setNewGoalCategory('');
    setNewGoalDuration(60);
    setShowGoalsModal(true);
  };

  const handleUpdateGoalMinutes = (id: string, targetMinutes: number) => {
    setEditingGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, targetMinutes: Math.max(10, targetMinutes) } : g))
    );
  };

  const handleRemoveGoal = (id: string) => {
    setEditingGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = newGoalCategory.trim();
    if (!cat) return;
    const exists = editingGoals.some((g) => g.category.toLowerCase() === cat.toLowerCase());
    if (exists) {
      alert(`A goal for "${cat}" already exists. You can adjust its target duration directly.`);
      return;
    }
    const newGoal: WorkoutGoal = {
      id: `goal-${Date.now()}`,
      category: cat,
      targetMinutes: Math.max(10, newGoalDuration)
    };
    setEditingGoals((prev) => [...prev, newGoal]);
    setNewGoalCategory('');
    setNewGoalDuration(60);
  };

  const handleResetGoalsToDefault = () => {
    setEditingGoals(JSON.parse(JSON.stringify(DEFAULT_WORKOUT_GOALS)));
  };

  const handleSaveGoals = () => {
    onUpdateProfile({
      ...profile,
      workoutGoals: editingGoals
    });
    setShowGoalsModal(false);
    setExportNotice('Weekly workout duration goals updated successfully!');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleQuickLogForCategory = (category: string) => {
    const standardCategories: WorkoutLog['category'][] = ['Strength', 'Cardio', 'HIIT', 'Mobility', 'Calisthenics'];
    const matched = standardCategories.find((c) => c.toLowerCase() === category.toLowerCase()) || 'Strength';
    setWorkoutCategory(matched);
    setWorkoutTitle(`${category} Session`);
    setShowWorkoutModal(true);
  };

  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'strength':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          progressBar: 'from-emerald-500 to-teal-400',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          borderGlow: 'hover:border-emerald-500/50',
          IconComponent: Dumbbell
        };
      case 'cardio':
        return {
          badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          progressBar: 'from-orange-500 to-amber-400',
          iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          borderGlow: 'hover:border-orange-500/50',
          IconComponent: Flame
        };
      case 'hiit':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          progressBar: 'from-rose-500 to-pink-500',
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          borderGlow: 'hover:border-rose-500/50',
          IconComponent: Zap
        };
      case 'calisthenics':
        return {
          badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          progressBar: 'from-purple-500 to-indigo-500',
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          borderGlow: 'hover:border-purple-500/50',
          IconComponent: Layers
        };
      case 'mobility':
        return {
          badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          progressBar: 'from-cyan-500 to-blue-500',
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          borderGlow: 'hover:border-cyan-500/50',
          IconComponent: Activity
        };
      default:
        return {
          badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          progressBar: 'from-indigo-500 to-violet-500',
          iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          borderGlow: 'hover:border-indigo-500/50',
          IconComponent: Target
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Biometric Intelligence & Fitness Lab
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time step counter, calorie expenditure, heart rate zone mapping, BMI progression tracking, and tailored protein & workout architecture.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 hover:border-emerald-500/50 transition-all shadow-sm"
            title="Export all workout logs to a CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Monthly Report</span>
          </button>
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout Day</span>
          </button>
        </div>
      </div>

      {/* Export Notification Banner */}
      {exportNotice && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-400 hover:text-white text-xs p-1 rounded hover:bg-emerald-500/20 transition-colors"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Daily Live Biometrics Ring & Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Step Counter */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Step Calorie Counter</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{profile.todaySteps.toLocaleString()}</span>
            <span className="text-xs font-mono text-zinc-400">/ {profile.dailyStepsTarget.toLocaleString()}</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((profile.todaySteps / profile.dailyStepsTarget) * 100))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>~{Math.round(profile.todaySteps * 0.042)} kcal burned walking</span>
            <span className="text-emerald-400 font-mono font-medium">
              {Math.round((profile.todaySteps / profile.dailyStepsTarget) * 100)}%
            </span>
          </div>
        </div>

        {/* Metric 2: Total Active Calories */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Caloric Expenditure</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{profile.todayCaloriesBurned}</span>
            <span className="text-xs font-mono text-zinc-400">/ {profile.dailyCaloriesTarget} kcal</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((profile.todayCaloriesBurned / profile.dailyCaloriesTarget) * 100))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Metabolic base: 1,840 kcal</span>
            <span className="text-orange-400 font-mono font-medium">High Output</span>
          </div>
        </div>

        {/* Metric 3: Active Heart Rate & Zone */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Heart Rate Dynamics</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500/30" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{profile.todayActiveHeartRate}</span>
            <span className="text-xs font-mono text-rose-400">BPM</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Zone 2: 122 - 138 bpm</span>
            <span className="text-rose-400 font-mono">Fat Oxidation</span>
          </div>
        </div>

        {/* Metric 4: BMI & Body Type Badge */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Body Composition Index</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{currentBmi}</span>
            <span className={`text-xs font-medium ${bmiMeta.color}`}>{bmiMeta.label}</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            {/* BMI gauge range: 15 to 35 */}
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(10, ((currentBmi - 15) / 20) * 100))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>{profile.weightKg}kg / {profile.heightCm}cm</span>
            <span className="text-indigo-400 font-mono font-medium">{calcBodyType}</span>
          </div>
        </div>
      </div>

      {/* High-Defense Personalized Protein & Workout Planner (Interactive Calculator) */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> High Defense Protocol
              </span>
              <span className="text-xs text-zinc-400">Body-type specific nutritional kinesiology</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Personalized Protein Intake & Body-Type Workout Calculator
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accurately calibrates daily macronutrient thresholds and hyper-specific training volume for your skeletal frame.
            </p>
          </div>

          <button
            onClick={handleGenerateAiFitness}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingAi ? 'Calculating Neural Protocol...' : 'Generate Full AI Workout Routine'}</span>
          </button>
        </div>

        {/* Input Parameters Form */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Height (cm)</label>
            <input
              type="number"
              value={calcHeight}
              onChange={(e) => setCalcHeight(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Age</label>
            <input
              type="number"
              value={calcAge}
              onChange={(e) => setCalcAge(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Body Type</label>
            <select
              value={calcBodyType}
              onChange={(e) => setCalcBodyType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Ectomorph">Ectomorph (Slim, Fast Metabolism)</option>
              <option value="Mesomorph">Mesomorph (Athletic, Muscular)</option>
              <option value="Endomorph">Endomorph (Solid, Slower Metabolism)</option>
              <option value="Athletic Balanced">Athletic Balanced</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Target Goal</label>
            <select
              value={calcGoal}
              onChange={(e) => setCalcGoal(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Hypertrophy & Muscle Gain">Hypertrophy & Lean Bulk</option>
              <option value="Fat Loss & Preservation">Fat Loss & Preservation</option>
              <option value="Strength & Athletic Performance">Strength & Power</option>
              <option value="Endurance & Stamina">Endurance & Conditioning</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveBmi}
              className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
            >
              Update Baseline
            </button>
          </div>
        </div>

        {/* Protein & Macro Recommendation Banner */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-850/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Target Daily Protein Intake</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              {recommendedDailyProtein}g
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {proteinPerKg}g/kg of bodyweight for {calcGoal}. Ideal for maximum muscle protein synthesis (MPS).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-850/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Optimal Macro Distribution</span>
            <div className="flex items-center gap-3 mt-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold">Protein: 30%</span>
              <span className="text-amber-400 font-bold">Carbs: 45%</span>
              <span className="text-cyan-400 font-bold">Fats: 25%</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              4 distinct meal feedings of ~{Math.round(recommendedDailyProtein / 4)}g protein spaced 3.5 hours apart.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-850/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Body Type Adaptation Strategy</span>
            <div className="text-sm font-semibold text-white mt-1 capitalize">
              {calcBodyType} Hypertrophy Protocol
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Emphasize compound multi-joint movements (squat, bench, deadlift) with 8-12 rep hypertrophy ranges.
            </p>
          </div>
        </div>

        {/* AI Workout Plan Output (if generated) */}
        {aiProtocol && aiProtocol.weeklyWorkoutPlan && (
          <div className="mt-6 pt-5 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Tailored Weekly Exercise Routine ({calcBodyType} Fitted)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {aiProtocol.weeklyWorkoutPlan.map((planDay: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span>{planDay.day}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {planDay.duration}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-zinc-100 mt-1">{planDay.title}</div>
                  <ul className="mt-2.5 space-y-1 text-[11px] text-zinc-300">
                    {planDay.exercises?.map((ex: string, i: number) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {aiProtocol.dietaryTips && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                <span className="text-xs font-semibold text-emerald-300 block mb-1">Key Nutrition Protocol Rules:</span>
                <ul className="text-xs text-emerald-200/90 space-y-1 list-disc list-inside">
                  {aiProtocol.dietaryTips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weekly Workout Goals & Target Durations Section */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Decorative subtle ambient backdrop glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <Target className="w-3.5 h-3.5" /> Workout Goals & Discipline Pacing
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {targetDateRange.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Weekly Exercise Target Durations
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set customized weekly minute thresholds for each exercise category and track real-time progression toward your athletic standards.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
            {/* Timeframe switch */}
            <div className="flex items-center p-0.5 bg-zinc-800/90 rounded-lg border border-zinc-700/80 text-xs">
              <button
                type="button"
                onClick={() => setGoalTimeframe('current-week')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  goalTimeframe === 'current-week'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Current Week
              </button>
              <button
                type="button"
                onClick={() => setGoalTimeframe('rolling-7')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  goalTimeframe === 'rolling-7'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Last 7 Days
              </button>
            </div>

            {/* Set / Edit Goals Button */}
            <button
              onClick={handleOpenGoalsModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 hover:text-white text-xs font-semibold border border-zinc-700 hover:border-emerald-500/50 transition-all shadow-sm active:scale-95"
            >
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <span>Set Weekly Targets</span>
            </button>
          </div>
        </div>

        {/* Weekly Overview Summary Metrics */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          <div className="p-3.5 rounded-xl bg-zinc-850/70 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium block">Total Weekly Target</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold font-mono text-white">{totalWeeklyTargetMinutes}</span>
              <span className="text-xs text-zinc-400 font-mono">min</span>
              <span className="text-[11px] text-zinc-500 font-mono ml-1">
                (~{(totalWeeklyTargetMinutes / 60).toFixed(1)} hrs)
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block mt-1">Sum of all discipline goals</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-850/70 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium block">Logged Duration</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-400">{totalWeeklyLoggedMinutes}</span>
              <span className="text-xs text-zinc-400 font-mono">min</span>
              <span className="text-[11px] text-zinc-500 font-mono ml-1">
                (~{(totalWeeklyLoggedMinutes / 60).toFixed(1)} hrs)
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block mt-1">In {targetDateRange.startStr} to {targetDateRange.endStr}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-850/70 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium block">Overall Completion</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-white">{overallWeeklyPct}%</span>
              <span className={`text-[11px] font-semibold ${overallWeeklyPct >= 100 ? 'text-emerald-400' : overallWeeklyPct >= 50 ? 'text-cyan-400' : 'text-amber-400'}`}>
                {overallWeeklyPct >= 100 ? 'Target Surpassed' : overallWeeklyPct >= 50 ? 'On Track' : 'In Progress'}
              </span>
            </div>
            <div className="mt-2 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallWeeklyPct)}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-850/70 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium block">Targets Met</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-white">{totalCompletedGoals}</span>
              <span className="text-xs font-mono text-zinc-400">/ {goalProgressItems.length} goals</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium block mt-1 flex items-center gap-1">
              <Award className="w-3 h-3 inline" />
              {totalCompletedGoals === goalProgressItems.length
                ? 'All weekly targets cleared!'
                : `${goalProgressItems.length - totalCompletedGoals} discipline${goalProgressItems.length - totalCompletedGoals === 1 ? '' : 's'} remaining`}
            </span>
          </div>
        </div>

        {/* Goals Grid Cards */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {goalProgressItems.map((goal) => {
            const style = getCategoryStyle(goal.category);
            const Icon = style.IconComponent;
            const targetHrs = (goal.targetMinutes / 60).toFixed(1);

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl bg-zinc-850/60 border border-zinc-800 transition-all ${style.borderGlow} hover:bg-zinc-850/90 flex flex-col justify-between`}
              >
                <div>
                  {/* Card Header: Icon, Category Name, and Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${style.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{goal.category}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Target: {goal.targetMinutes} min ({targetHrs}h/wk)
                        </span>
                      </div>
                    </div>

                    {goal.isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Achieved!
                      </span>
                    ) : goal.actualMinutes > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {goal.remainingMinutes}m left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700">
                        0m logged
                      </span>
                    )}
                  </div>

                  {/* Main Progress Numbers */}
                  <div className="flex items-baseline justify-between mt-2 font-mono">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-white">{goal.actualMinutes}</span>
                      <span className="text-xs text-zinc-400">/ {goal.targetMinutes} min</span>
                    </div>
                    <span className={`text-xs font-bold ${goal.isCompleted ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {goal.pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style.progressBar} transition-all duration-500 ${
                        goal.isCompleted ? 'shadow-sm shadow-emerald-400/50' : ''
                      }`}
                      style={{ width: `${Math.min(100, goal.pct)}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer: Metadata and Quick-Log action */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="space-y-0.5">
                    <div>
                      <span className="text-zinc-300 font-medium">{goal.sessionsCount}</span> session{goal.sessionsCount === 1 ? '' : 's'} logged
                    </div>
                    {goal.calories > 0 && (
                      <div className="text-[10px] font-mono text-orange-400/90">
                        {goal.calories} kcal burned
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickLogForCategory(goal.category)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 hover:border-emerald-500/40 transition-colors"
                    title={`Log a ${goal.category} workout session`}
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>Log {goal.category}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Workout Calendar Visualizer */}
      <WorkoutCalendar
        workouts={workouts}
        onAddWorkoutForDate={handleOpenModalForDate}
      />

      {/* Workout Logs & BMI Historical Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workout History (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Workout Intensity History
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Chronological record of exertion and heart rate loads</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400">{workouts.length} recorded</span>
              <button
                onClick={handleExportCsv}
                disabled={workouts.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 hover:border-emerald-500/40 disabled:opacity-40 transition-all"
                title="Export workout logs to CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 30-Day Workout Intensity Line Chart */}
          <div className="mt-4 mb-3 p-4 rounded-xl bg-zinc-850/60 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>30-Day Average Workout Intensity Curve</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Low (1) → Extreme (4)</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={intensityChartData} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    domain={[0, 4.2]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(val) => {
                      if (val === 4) return 'Ext';
                      if (val === 3) return 'Hi';
                      if (val === 2) return 'Med';
                      if (val === 1) return 'Low';
                      return '';
                    }}
                  />
                  <Tooltip content={<CustomIntensityTooltip />} />
                  <ReferenceLine y={2.5} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.25} />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (!payload.hasWorkout) return null;
                      return (
                        <circle
                          key={`dot-${payload.date}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="#10b981"
                          stroke="#09090b"
                          strokeWidth={2}
                          className="hover:scale-125 transition-transform"
                        />
                      );
                    }}
                    activeDot={{ r: 6, fill: '#34d399', stroke: '#064e3b', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="divide-y divide-zinc-800/60 mt-2">
            {workouts.map((w) => (
              <div key={w.id} className="py-3 px-2 rounded-lg hover:bg-zinc-850/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">{w.date}</span>
                    <span className="font-semibold text-sm text-zinc-200">{w.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      w.intensity === 'Extreme'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : w.intensity === 'High'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {w.intensity}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>Duration: {w.durationMinutes}m</span>
                  <span>•</span>
                  <span className="text-orange-400 font-semibold">{w.caloriesBurned} kcal</span>
                  <span>•</span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500/40 inline" /> Avg {w.avgHeartRate} bpm (Peak {w.peakHeartRate})
                  </span>
                </div>

                {w.exercises && w.exercises.length > 0 && (
                  <div className="mt-2 text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded border border-zinc-700/40">
                    <span className="text-zinc-500 mr-1.5 font-medium">Logged:</span>
                    {w.exercises.join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BMI & Body Fat Timeline (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/90 border border-zinc-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Monthly BMI Progression
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Historical change over time</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">Δ -1.4 BMI (Recomposition)</span>
            </div>

            {/* Visual SVG Mini Trend Chart */}
            <div className="mt-4 p-3 rounded-lg bg-zinc-850/60 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-2 font-mono">BMI Index Trend (Past Months):</span>
              <svg viewBox="0 0 300 90" className="w-full h-20 overflow-visible">
                {/* Baseline grid */}
                <line x1="0" y1="45" x2="300" y2="45" stroke="#3f3f46" strokeDasharray="4 4" strokeWidth="1" />
                {/* Polyline line chart */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={bmiRecords
                    .map((r, i) => {
                      const x = (i / Math.max(1, bmiRecords.length - 1)) * 280 + 10;
                      // map BMI 23.0 - 25.0 to 10 - 80 px
                      const y = 80 - ((r.bmi - 22.8) / 2.2) * 65;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {/* Dots on points */}
                {bmiRecords.map((r, i) => {
                  const x = (i / Math.max(1, bmiRecords.length - 1)) * 280 + 10;
                  const y = 80 - ((r.bmi - 22.8) / 2.2) * 65;
                  return (
                    <g key={r.id}>
                      <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#09090b" strokeWidth="2" />
                      <text x={x} y={y - 8} fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {r.bmi}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 space-y-2">
              {bmiRecords.slice(-4).reverse().map((rec) => (
                <div key={rec.id} className="p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-zinc-400">{rec.date}</span>
                    <span className="text-zinc-200 ml-2 font-medium">{rec.weightKg} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">BMI {rec.bmi}</span>
                    {rec.bodyFatPct && <span className="text-zinc-400 font-mono text-[11px]">({rec.bodyFatPct}% BF)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="mt-4 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Full Comprehensive Monthly Fitness Report</span>
          </button>
        </div>
      </div>

      {/* Log Workout Day Modal */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Log Workout Day</h3>
            <p className="text-xs text-zinc-400 mb-4">Record duration, heart rate peaks, calorie burn, and exercise movements.</p>

            <form onSubmit={handleCreateWorkout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chest & Tricep Hypertrophy Overload"
                    value={workoutTitle}
                    onChange={(e) => setWorkoutTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Workout Date</label>
                  <input
                    type="date"
                    required
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
                  <select
                    value={workoutCategory}
                    onChange={(e) => setWorkoutCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Strength">Strength & Hypertrophy</option>
                    <option value="Cardio">Cardio & Zone 2</option>
                    <option value="HIIT">HIIT & Conditioning</option>
                    <option value="Calisthenics">Calisthenics</option>
                    <option value="Mobility">Mobility & Yoga</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Exertion Intensity</label>
                  <select
                    value={workoutIntensity}
                    onChange={(e) => setWorkoutIntensity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Low">Low (Active Recovery)</option>
                    <option value="Moderate">Moderate (Steady State)</option>
                    <option value="High">High (Hypertrophy / Hard sets)</option>
                    <option value="Extreme">Extreme (Failure / PR sets)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Duration (m)</label>
                  <input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Calories</label>
                  <input
                    type="number"
                    value={workoutCalories}
                    onChange={(e) => setWorkoutCalories(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Avg HR</label>
                  <input
                    type="number"
                    value={workoutAvgHr}
                    onChange={(e) => setWorkoutAvgHr(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Peak HR</label>
                  <input
                    type="number"
                    value={workoutPeakHr}
                    onChange={(e) => setWorkoutPeakHr(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Exercises & Sets</label>
                <textarea
                  rows={2}
                  value={workoutExercises}
                  onChange={(e) => setWorkoutExercises(e.target.value)}
                  placeholder="e.g. Barbell Incline (4x8), DB Curls (3x12)"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowWorkoutModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Monthly Fitness & Biometric Report</h3>
                  <span className="text-xs text-zinc-400 font-mono">Period: October 2026 • ApexLife Clinical Summary</span>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-zinc-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-zinc-300">
              <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Current Weight</span>
                  <span className="text-lg font-bold text-white font-mono">{profile.weightKg} kg</span>
                  <span className="text-emerald-400 text-[10px] block">-4.5kg over 4 mo</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Current BMI</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{currentBmi}</span>
                  <span className="text-zinc-400 text-[10px] block">Optimal Normative</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Monthly Workouts</span>
                  <span className="text-lg font-bold text-white font-mono">{workouts.length + 14} sessions</span>
                  <span className="text-cyan-400 text-[10px] block">4.2 sessions / wk</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Avg Workout HR</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">137 bpm</span>
                  <span className="text-zinc-400 text-[10px] block">Zone 2-3 predominance</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. Anthropometric & Body Composition Analysis</h4>
                <p className="leading-relaxed text-zinc-300">
                  Subject presents a favorable mesomorphic body recomposition trajectory. BMI decreased progressively from 24.6 to {currentBmi} with concurrent increases in lean tissue mass. Basal metabolic rate estimated at 1,760 kcal/day, with total daily energy expenditure (TDEE) reaching ~2,600 kcal.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">2. Cardiovascular & Intensity Stress Tolerance</h4>
                <p className="leading-relaxed text-zinc-300">
                  Cardiovascular resilience demonstrates steady adaptation. Resting heart rate trending downward to 58 bpm. Peak heart rate loads during High/Extreme resistance sessions reached {workouts[0]?.peakHeartRate || 169} bpm with rapid parasympathetic recovery within 90 seconds post-set.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">3. Nutritional & Protein Recommendation Directives</h4>
                <div className="p-3 rounded-lg bg-zinc-800/80 border border-zinc-700/60 font-mono text-[11px] space-y-1">
                  <div>• Daily Protein Target: <span className="text-emerald-400 font-bold">{recommendedDailyProtein} grams</span> (2.0g/kg lean mass)</div>
                  <div>• Hydration Protocol: 3.5 liters mineralized water daily</div>
                  <div>• Creatine Saturation: 5g daily continuous maintenance</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
                title="Export all workout logs to CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Weekly Workout Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-700 p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Set Weekly Target Durations</h3>
                  <p className="text-xs text-zinc-400 font-mono">Calibrate weekly minute quotas for each exercise discipline</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="text-zinc-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Existing Goals List */}
            <div className="mt-5 space-y-3.5">
              <span className="text-xs font-semibold text-zinc-300 block">Active Target Categories</span>
              {editingGoals.map((g) => {
                const style = getCategoryStyle(g.category);
                const Icon = style.IconComponent;
                const hours = (g.targetMinutes / 60).toFixed(1);

                return (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-xl bg-zinc-850 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <div className={`p-1.5 rounded-md border ${style.iconBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{g.category}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">{hours} hrs/week</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateGoalMinutes(g.id, g.targetMinutes - 15)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-xs font-mono text-zinc-300 border border-zinc-700"
                          title="Minus 15 minutes"
                        >
                          -15m
                        </button>
                        <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                          <input
                            type="number"
                            min="10"
                            step="5"
                            value={g.targetMinutes}
                            onChange={(e) => handleUpdateGoalMinutes(g.id, parseInt(e.target.value) || 0)}
                            className="w-14 bg-transparent text-sm font-mono text-white text-center focus:outline-none"
                          />
                          <span className="text-xs font-mono text-zinc-400">min</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateGoalMinutes(g.id, g.targetMinutes + 15)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-xs font-mono text-zinc-300 border border-zinc-700"
                          title="Plus 15 minutes"
                        >
                          +15m
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateGoalMinutes(g.id, g.targetMinutes + 30)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-xs font-mono text-zinc-300 border border-zinc-700"
                          title="Plus 30 minutes"
                        >
                          +30m
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(g.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                        title="Remove goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {editingGoals.length === 0 && (
                <div className="p-4 rounded-xl bg-zinc-850/50 border border-dashed border-zinc-800 text-center text-xs text-zinc-400">
                  No targets configured. Add a category below or reset to defaults.
                </div>
              )}
            </div>

            {/* Add New Goal Category */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <span className="text-xs font-semibold text-zinc-300 block mb-2">Add New Target Category</span>
              <form onSubmit={handleAddCustomGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="e.g. Swimming, Boxing, Yoga, Cycling"
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="flex items-center px-2 py-2 rounded-lg bg-zinc-800 border border-zinc-700">
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={newGoalDuration}
                      onChange={(e) => setNewGoalDuration(Number(e.target.value))}
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                    <span className="text-[11px] text-zinc-400 font-mono">min</span>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={!newGoalCategory.trim()}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold border border-zinc-700 hover:border-emerald-500/50 transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Target</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetGoalsToDefault}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Standard Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoals}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Weekly Goals</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
