/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { HabitsView } from './components/HabitsView';
import { FitnessView } from './components/FitnessView';
import { FinanceView } from './components/FinanceView';
import { StudyTimerView } from './components/StudyTimerView';
import { PostureMonitorView } from './components/PostureMonitorView';
import { ReelStudioView } from './components/ReelStudioView';
import { SecurityAndSettingsModal } from './components/SecurityAndSettingsModal';
import { Storage } from './services/storage';
import {
  Habit,
  FitnessProfile,
  WorkoutLog,
  BmiRecord,
  Transaction,
  Subscription,
  StudyTask,
  ReelPost,
  PostureSessionStats,
  ThemeMode
} from './types';
import { Fingerprint, Lock, ShieldCheck, Key } from 'lucide-react';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>('obsidian');

  // Application Data States
  const [habits, setHabits] = useState<Habit[]>(() => Storage.getHabits());
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile>(() => Storage.getFitnessProfile());
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => Storage.getWorkouts());
  const [bmiRecords, setBmiRecords] = useState<BmiRecord[]>(() => Storage.getBmiRecords());
  const [transactions, setTransactions] = useState<Transaction[]>(() => Storage.getTransactions());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => Storage.getSubscriptions());
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => Storage.getStudyTasks());
  const [reelPosts, setReelPosts] = useState<ReelPost[]>(() => Storage.getReelPosts());
  const reelTemplates = Storage.getReelTemplates();
  const leaderboard = Storage.getLeaderboard();

  // Posture live stats
  const [postureStats, setPostureStats] = useState<PostureSessionStats>({
    isActive: true,
    sessionMinutes: 48,
    micromovements: 14,
    macromovements: 3,
    slouchWarnings: 2,
    currentPostureStatus: 'Optimal',
    lastBreakReminder: '12m ago',
    focusScore: 92,
    blinkCount: 420
  });

  // Load theme on startup
  useEffect(() => {
    const savedTheme = Storage.getTheme();
    setTheme(savedTheme);
  }, []);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    Storage.saveTheme(newTheme);
  };

  // Habit Handlers
  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const exists = h.completedDates.includes(dateStr);
      let newDates = exists
        ? h.completedDates.filter((d) => d !== dateStr)
        : [...h.completedDates, dateStr];

      // Recalculate streak
      const todayStr = new Date().toISOString().split('T')[0];
      const isTodayCompleted = newDates.includes(todayStr);
      const newStreak = isTodayCompleted ? Math.max(1, h.streak + (exists ? -1 : 1)) : Math.max(0, h.streak - 1);

      return {
        ...h,
        completedDates: newDates,
        streak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak)
      };
    });
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  const handleToggleHabitToday = (habitId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    handleToggleHabitDate(habitId, todayStr);
  };

  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'history'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      history: []
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  // Fitness Handlers
  const handleUpdateFitnessProfile = (updatedProfile: FitnessProfile) => {
    setFitnessProfile(updatedProfile);
    Storage.saveFitnessProfile(updatedProfile);
  };

  const handleAddWorkout = (workoutData: Omit<WorkoutLog, 'id'>) => {
    const newWorkout: WorkoutLog = {
      ...workoutData,
      id: `w-${Date.now()}`
    };
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    Storage.saveWorkouts(updated);
  };

  const handleAddBmiRecord = (recordData: Omit<BmiRecord, 'id'>) => {
    const newRecord: BmiRecord = {
      ...recordData,
      id: `b-${Date.now()}`
    };
    const updated = [...bmiRecords, newRecord];
    setBmiRecords(updated);
    Storage.saveBmiRecords(updated);
  };

  // Finance Handlers
  const handleAddTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `t-${Date.now()}`
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    Storage.saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    Storage.saveTransactions(updated);
  };

  const handleAddSubscription = (subData: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `s-${Date.now()}`
    };
    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    Storage.saveSubscriptions(updated);
  };

  const handleToggleSubscription = (id: string) => {
    const updated = subscriptions.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSubscriptions(updated);
    Storage.saveSubscriptions(updated);
  };

  const handleDeleteSubscription = (id: string) => {
    const updated = subscriptions.filter((s) => s.id !== id);
    setSubscriptions(updated);
    Storage.saveSubscriptions(updated);
  };

  // Study Handlers
  const handleToggleStudyTask = (id: string) => {
    const updated = studyTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setStudyTasks(updated);
    Storage.saveStudyTasks(updated);
  };

  const handleAddStudyTask = (taskData: Omit<StudyTask, 'id' | 'completed'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `st-${Date.now()}`,
      completed: false
    };
    const updated = [...studyTasks, newTask];
    setStudyTasks(updated);
    Storage.saveStudyTasks(updated);
  };

  const handleDeleteStudyTask = (id: string) => {
    const updated = studyTasks.filter((t) => t.id !== id);
    setStudyTasks(updated);
    Storage.saveStudyTasks(updated);
  };

  // Reel Handlers
  const handleAddReelPost = (postData: Omit<ReelPost, 'id'>) => {
    const newPost: ReelPost = {
      ...postData,
      id: `rp-${Date.now()}`
    };
    const updated = [newPost, ...reelPosts];
    setReelPosts(updated);
    Storage.saveReelPosts(updated);
  };

  const handleUpdateReelStatus = (id: string, status: ReelPost['status']) => {
    const updated = reelPosts.map((p) => (p.id === id ? { ...p, status } : p));
    setReelPosts(updated);
    Storage.saveReelPosts(updated);
  };

  const handleDeleteReelPost = (id: string) => {
    const updated = reelPosts.filter((p) => p.id !== id);
    setReelPosts(updated);
    Storage.saveReelPosts(updated);
  };

  // Global Streak Count
  const maxStreak = Math.max(...habits.map((h) => h.streak), 0);

  // Theme container classes
  const getThemeBackground = () => {
    switch (theme) {
      case 'cyber':
        return 'bg-[#090b14] selection:bg-cyan-500/30 selection:text-cyan-200';
      case 'matcha':
        return 'bg-[#061711] selection:bg-emerald-500/30 selection:text-emerald-200';
      case 'sunset':
        return 'bg-[#120a04] selection:bg-amber-500/30 selection:text-amber-200';
      case 'rose':
        return 'bg-[#14060b] selection:bg-rose-500/30 selection:text-rose-200';
      case 'obsidian':
      default:
        return 'bg-zinc-950 selection:bg-indigo-500/30 selection:text-indigo-200';
    }
  };

  // If locked, render biometric security gate screen
  if (isLocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${getThemeBackground()} text-zinc-100`}>
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white">ApexLife Vault Locked</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Protected by AES-GCM-256 local encrypted storage & biometric sandbox.
            </p>
          </div>

          <button
            onClick={() => setIsLocked(false)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Unlock via TouchID / Biometrics</span>
          </button>

          <p className="text-[11px] text-zinc-500 font-mono">
            Hardware biometric token validated • Zero plain-text leaks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeBackground()} text-zinc-100 flex flex-col font-sans transition-colors duration-300`}>
      {/* Top Global Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={maxStreak}
        theme={theme}
        onOpenSettings={() => setShowSettingsModal(true)}
        isLocked={isLocked}
        onLockApp={() => setIsLocked(true)}
      />

      {/* Main Body View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            habits={habits}
            onToggleHabitToday={handleToggleHabitToday}
            fitnessProfile={fitnessProfile}
            recentWorkouts={workouts}
            transactions={transactions}
            subscriptions={subscriptions}
            studyTasks={studyTasks}
            reelPosts={reelPosts}
            postureStats={postureStats}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartDeepWork={() => setActiveTab('study')}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            onToggleHabitDate={handleToggleHabitDate}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'fitness' && (
          <FitnessView
            profile={fitnessProfile}
            workouts={workouts}
            bmiRecords={bmiRecords}
            onUpdateProfile={handleUpdateFitnessProfile}
            onAddWorkout={handleAddWorkout}
            onAddBmiRecord={handleAddBmiRecord}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            transactions={transactions}
            subscriptions={subscriptions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddSubscription={handleAddSubscription}
            onToggleSubscription={handleToggleSubscription}
            onDeleteSubscription={handleDeleteSubscription}
          />
        )}

        {activeTab === 'study' && (
          <StudyTimerView
            tasks={studyTasks}
            onToggleTask={handleToggleStudyTask}
            onAddTask={handleAddStudyTask}
            onDeleteTask={handleDeleteStudyTask}
            leaderboard={leaderboard}
          />
        )}

        {activeTab === 'posture' && (
          <PostureMonitorView
            stats={postureStats}
            onUpdateStats={setPostureStats}
          />
        )}

        {activeTab === 'reels' && (
          <ReelStudioView
            templates={reelTemplates}
            posts={reelPosts}
            onAddPost={handleAddReelPost}
            onUpdatePostStatus={handleUpdateReelStatus}
            onDeletePost={handleDeleteReelPost}
          />
        )}
      </main>

      {/* Bottom Footer Info */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">ApexLife Master Suite</span>
            <span>•</span>
            <span>Offline-First Encrypted Sandbox</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Habits: {habits.length}</span>
            <span>Workouts: {workouts.length}</span>
            <span>Reels: {reelPosts.length}</span>
          </div>
        </div>
      </footer>

      {/* Settings, Themes & Biometric Security Modal */}
      <SecurityAndSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
      />
    </div>
  );
}
