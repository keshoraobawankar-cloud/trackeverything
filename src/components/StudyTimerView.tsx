import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  Calendar,
  CheckCircle2,
  Trophy,
  Share2,
  AlertCircle,
  Zap,
  Coffee,
  Plus,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { StudyTask, StudyPlanAIResponse, LeaderboardUser } from '../types';
import { ANIME_CHARACTERS, speakAnimeMotivation, playChimeTone } from '../services/audioMotivational';
import { ApiService } from '../services/api';

interface StudyTimerViewProps {
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  onDeleteTask: (id: string) => void;
  leaderboard: LeaderboardUser[];
}

export const StudyTimerView: React.FC<StudyTimerViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  leaderboard
}) => {
  // Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(50); // minutes
  const [breakDuration, setBreakDuration] = useState<number>(10); // minutes
  const [isBreak, setIsBreak] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(4);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('shonen-hero');
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('08:00 AM');
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const [newTaskSubject, setNewTaskSubject] = useState('Computer Science');
  const [newTaskMorning, setNewTaskMorning] = useState(true);
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<StudyTask['difficulty']>('High Friction');

  // AI Study Plan Generator inputs
  const [aiSubject, setAiSubject] = useState('Distributed Algorithms & Rust Systems');
  const [aiCurrentLevel, setAiCurrentLevel] = useState('Intermediate');
  const [aiGaps, setAiGaps] = useState('Memory retention of raft consensus and morning brain fog');
  const [aiHours, setAiHours] = useState(25);
  const [aiGoal, setAiGoal] = useState('Flawless mastery for upcoming senior defense');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanAIResponse | null>(null);

  // Share message toast
  const [copiedBadge, setCopiedBadge] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isBreak]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playChimeTone('alarm');

    if (!isBreak) {
      setCompletedSessionsCount((c) => c + 1);
      // Trigger motivational anime speech!
      speakAnimeMotivation(selectedCharacterId);
      // Switch to break
      setIsBreak(true);
      setSecondsRemaining(breakDuration * 60);
    } else {
      playChimeTone('focus');
      speakAnimeMotivation(selectedCharacterId, 'Break is over! Time to reignite your focus and conquer the next milestone!');
      setIsBreak(false);
      setSecondsRemaining(selectedDuration * 60);
    }
  };

  const handleSetPreset = (focusMins: number, breakMins: number) => {
    setIsRunning(false);
    setIsBreak(false);
    setSelectedDuration(focusMins);
    setBreakDuration(breakMins);
    setSecondsRemaining(focusMins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsRemaining(selectedDuration * 60);
  };

  const handlePlayPreview = async (charId: string) => {
    setIsPlayingAudioPreview(true);
    await speakAnimeMotivation(charId);
    setIsPlayingAudioPreview(false);
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await ApiService.generateStudyPlan({
        subject: aiSubject,
        currentLevel: aiCurrentLevel,
        gaps: aiGaps,
        weeklyHours: aiHours,
        targetGoal: aiGoal
      });
      setStudyPlan(plan);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      timeSlot: newTaskTime,
      durationMinutes: newTaskDuration,
      isMorningPriority: newTaskMorning,
      subject: newTaskSubject,
      difficulty: newTaskDifficulty
    });
    setNewTaskTitle('');
    setShowTaskModal(false);
  };

  const handleShareLeaderboard = () => {
    const text = `🏆 Tanmay is on an 18-day study streak with 28.5 focus hours logged this week on ApexLife! Rank #2.`;
    navigator.clipboard?.writeText(text);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 3000);
  };

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const totalSeconds = isBreak ? breakDuration * 60 : selectedDuration * 60;
  const progressPct = Math.round(((totalSeconds - secondsRemaining) / Math.max(1, totalSeconds)) * 100);

  // Sort tasks with Morning Priority first
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isMorningPriority && !b.isMorningPriority) return -1;
    if (!a.isMorningPriority && b.isMorningPriority) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            Deep Work Chamber & Cognitive Study AI
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pomodoro focus intervals, anime motivational alarms, morning-priority schedule optimizer, and AI study roadmaps.
          </p>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Task</span>
        </button>
      </div>

      {/* Main Focus Chamber & Anime Motivational Voices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timer Box (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-zinc-900/95 border border-zinc-800 p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                {isBreak ? 'Optimal Restorative Break' : 'Deep Work Focus Window'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{completedSessionsCount} sessions completed today</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '50m Deep Work / 10m', focus: 50, rest: 10 },
              { label: '25m Pomodoro / 5m', focus: 25, rest: 5 },
              { label: '90m Ultradian Flow / 15m', focus: 90, rest: 15 },
              { label: '15m Sprint / 3m', focus: 15, rest: 3 }
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSetPreset(preset.focus, preset.rest)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedDuration === preset.focus && !isBreak
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Large Countdown Display */}
          <div className="my-8 relative flex flex-col items-center justify-center">
            {/* SVG Ring Progress */}
            <div className="w-64 h-64 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="#27272a"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke={isBreak ? '#10b981' : '#6366f1'}
                  strokeWidth="8"
                  strokeDasharray="691"
                  strokeDashoffset={691 - (691 * progressPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white">
                  {timeFormatted}
                </span>
                <span className="text-xs uppercase font-mono tracking-widest text-zinc-400 mt-1">
                  {isBreak ? 'Resting Eyes & Spine' : 'Hyper-Immersion'}
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isRunning ? 'Pause Interval' : 'Start Focus'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Anime Motivational Voice Selector (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-zinc-900/95 border border-zinc-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <h2 className="text-sm font-bold text-white">Anime Motivational Alarms</h2>
              </div>
              <span className="text-[10px] uppercase font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Speech AI Synced
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              Select your personalized anime archetype to trigger tough-love, hype, or zen guidance upon timer finish.
            </p>

            <div className="mt-3 space-y-2">
              {ANIME_CHARACTERS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacterId(char.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border-indigo-500 shadow-sm shadow-indigo-500/20'
                        : 'bg-zinc-850/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{char.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(char.id);
                        }}
                        className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                      >
                        <Volume2 className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{char.animeArchetype}</div>
                    <p className="text-xs text-zinc-300 italic mt-1.5">"{char.tagline}"</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Audio engine: Web Speech & Resonant Chimes</span>
            <button
              onClick={() => handlePlayPreview(selectedCharacterId)}
              disabled={isPlayingAudioPreview}
              className="text-indigo-400 hover:underline font-medium text-xs"
            >
              {isPlayingAudioPreview ? 'Speaking...' : 'Test Alarm Tone'}
            </button>
          </div>
        </div>
      </div>

      {/* Morning-Priority Day Planner & Optimal Break Suggester */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Cognitive Priority Architecture
              </span>
              <span className="text-xs text-zinc-400">Morning 07:00-11:00 AM reserved for high friction</span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Day Planner: Morning Focus & Optimal Restorative Breaks
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400" /> Optimal Breaks Auto-Suggested
            </span>
          </div>
        </div>

        {/* Suggestion Notification Box */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/30 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="text-xs text-indigo-200">
            <span className="font-bold text-white">Cognitive Load Suggestion:</span> After your 07:30 AM 90-minute block on Distributed Systems, take a strict 20-minute screen-free walk at 09:15 AM to restore dopamine tone and consolidate memory.
          </div>
        </div>

        {/* Tasks List */}
        <div className="mt-4 space-y-2.5">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                task.completed
                  ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
                  : task.isMorningPriority
                  ? 'bg-zinc-850 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'bg-zinc-850/60 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-emerald-500 text-white'
                      : 'border border-zinc-600 hover:border-zinc-400 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                      {task.title}
                    </span>
                    {task.isMorningPriority && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Morning Prime
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>{task.timeSlot} ({task.durationMinutes}m)</span>
                    <span>•</span>
                    <span>{task.subject}</span>
                    <span>•</span>
                    <span className={task.difficulty === 'High Friction' ? 'text-rose-400 font-medium' : 'text-zinc-400'}>
                      {task.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Study Plan Generator according to Progress & Gaps */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gemini Cognitive Engine
              </span>
              <span className="text-xs text-zinc-400">Personalized learning gap analysis & routine adaptation</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              AI Personalized Study Plan & Gap Remediation Generator
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Analyzes your weak spots, current level, and available hours to construct a 4-week hyper-retention roadmap.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingPlan ? 'Synthesizing Cognitive Plan...' : 'Generate Personalized Plan'}</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Subject / Curriculum</label>
            <input
              type="text"
              value={aiSubject}
              onChange={(e) => setAiSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Current Progress Level</label>
            <input
              type="text"
              value={aiCurrentLevel}
              onChange={(e) => setAiCurrentLevel(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Identified Gaps / Difficulties</label>
            <input
              type="text"
              value={aiGaps}
              onChange={(e) => setAiGaps(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Weekly Dedicated Hours</label>
            <input
              type="number"
              value={aiHours}
              onChange={(e) => setAiHours(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* AI Output Card (if generated) */}
        {studyPlan && (
          <div className="mt-5 pt-4 border-t border-zinc-800 space-y-4">
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/30">
              <span className="text-xs uppercase font-mono text-indigo-400 font-bold block mb-1">Strategic Overview:</span>
              <p className="text-xs text-zinc-200 leading-relaxed">{studyPlan.summary}</p>
            </div>

            {/* Morning Priority Routine */}
            <div>
              <span className="text-xs font-bold text-white block mb-2">Morning Cognitive Prime Protocol:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {studyPlan.morningPriorityRoutine.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-xs text-zinc-300">
                    <span className="text-indigo-400 font-mono font-bold block mb-0.5">Phase {idx + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Weekly Milestones */}
            <div>
              <span className="text-xs font-bold text-white block mb-2">4-Week Milestone Trajectory:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {studyPlan.weeklyMilestones.map((m) => (
                  <div key={m.week} className="p-3 rounded-lg bg-zinc-850 border border-zinc-800 text-xs">
                    <div className="font-mono text-indigo-400 font-bold">Week {m.week}</div>
                    <div className="font-semibold text-white mt-1">{m.focus}</div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-mono">{m.deliverable}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap Remediation */}
            {studyPlan.gapRemediation && (
              <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                <span className="text-xs font-bold text-white block mb-2">Targeted Gap Remediation:</span>
                <div className="space-y-2">
                  {studyPlan.gapRemediation.map((gapItem, i) => (
                    <div key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-rose-400 font-bold font-mono">[{gapItem.gap}]:</span>
                      <span>{gapItem.fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social Study Leaderboard & Friend Challenge */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Global Study Leaderboard & Social Compete
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Compete on weekly deep work duration and streak consistency</p>
          </div>

          <button
            onClick={handleShareLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedBadge ? 'Stats Copied!' : 'Share Milestone'}</span>
          </button>
        </div>

        <div className="divide-y divide-zinc-800/60 mt-2">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`py-3 px-3 rounded-lg flex items-center justify-between transition-colors ${
                user.isCurrentUser ? 'bg-indigo-950/30 border border-indigo-500/30' : 'hover:bg-zinc-850/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono font-bold text-sm text-zinc-400">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </span>
                <span className="text-xl">{user.avatar}</span>
                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {user.habitStreakDays} day streak
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold font-mono text-indigo-400">{user.weeklyStudyHours}h</span>
                <span className="text-[11px] text-zinc-400 block font-mono">this week</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Deep Work Task</h3>
            <p className="text-xs text-zinc-400 mb-4">Set time slot and prioritize morning prime slots.</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Practice: LeetCode Graph Theory"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Difficulty</label>
                  <select
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
                  >
                    <option value="High Friction">High Friction (Challenging)</option>
                    <option value="Medium">Medium</option>
                    <option value="Light">Light (Review)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="morningPriorityCheck"
                  checked={newTaskMorning}
                  onChange={(e) => setNewTaskMorning(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-800 border-zinc-700"
                />
                <label htmlFor="morningPriorityCheck" className="text-xs text-zinc-300 font-medium cursor-pointer">
                  Prioritize in Morning Hours (Peak Cognitive Output)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
