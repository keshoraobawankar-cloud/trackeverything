import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { FitnessProfile, WorkoutLog, BmiRecord } from '../types';
import { ApiService } from '../services/api';

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
  // Workout log modal state
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
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

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle.trim()) return;
    const todayStr = new Date().toISOString().split('T')[0];
    onAddWorkout({
      date: todayStr,
      title: workoutTitle.trim(),
      category: workoutCategory,
      intensity: workoutIntensity,
      durationMinutes: workoutDuration,
      caloriesBurned: workoutCalories,
      avgHeartRate: workoutAvgHr,
      peakHeartRate: workoutPeakHr,
      exercises: workoutExercises.split(',').map(s => s.trim()).filter(Boolean)
    });
    // Also update today's active calories in profile
    onUpdateProfile({
      ...profile,
      todayCaloriesBurned: profile.todayCaloriesBurned + workoutCalories
    });
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

        <div className="flex items-center gap-2">
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
            <span className="text-xs font-mono text-zinc-400">{workouts.length} recorded</span>
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
              <div>
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
    </div>
  );
};
