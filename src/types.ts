export type ThemeMode = 'obsidian' | 'cyber' | 'matcha' | 'sunset' | 'rose';

export type HabitCategory = 'Health' | 'Work' | 'Personal' | 'Study' | 'Fitness' | string;

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekdays' | 'weekends';
  reminderTime: string;
  targetCount: number;
  unit: string;
  streak: number;
  bestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  history: { date: string; value: number }[];
  color: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  title: string;
  intensity: 'Low' | 'Moderate' | 'High' | 'Extreme';
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate: number;
  peakHeartRate: number;
  category: 'Strength' | 'Cardio' | 'HIIT' | 'Mobility' | 'Calisthenics';
  exercises: string[];
}

export interface BmiRecord {
  id: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPct?: number;
  notes: string;
}

export interface WorkoutGoal {
  id: string;
  category: 'Strength' | 'Cardio' | 'HIIT' | 'Mobility' | 'Calisthenics' | string;
  targetMinutes: number; // Weekly target duration in minutes
}

export interface FitnessProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  activityLevel: string;
  bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph' | 'Athletic Balanced';
  goal: 'Fat Loss & Preservation' | 'Hypertrophy & Muscle Gain' | 'Strength & Athletic Performance' | 'Endurance & Stamina';
  dailyStepsTarget: number;
  dailyCaloriesTarget: number;
  todaySteps: number;
  todayCaloriesBurned: number;
  todayActiveHeartRate: number;
  aiProtocol?: any;
  workoutGoals?: WorkoutGoal[];
}

export interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Housing' | 'Nutrition' | 'Fitness' | 'Tech & Tools' | 'Education' | 'Entertainment' | 'Freelance' | 'Salary';
}

export interface Subscription {
  id: string;
  serviceName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDayOfMonth: number;
  category: string;
  active: boolean;
  notes: string;
}

export interface StudyTask {
  id: string;
  title: string;
  timeSlot: string; // e.g. "07:30 AM"
  durationMinutes: number;
  isMorningPriority: boolean;
  completed: boolean;
  subject: string;
  difficulty: 'High Friction' | 'Medium' | 'Light';
}

export interface StudyPlanAIResponse {
  summary: string;
  morningPriorityRoutine: string[];
  weeklyMilestones: {
    week: number;
    focus: string;
    deliverable: string;
    keyConcepts: string[];
  }[];
  optimalStudySchedule: {
    timeBlock: string;
    phase: string;
    task: string;
    technique: string;
  }[];
  gapRemediation: {
    gap: string;
    fix: string;
    resourceHint: string;
  }[];
  cognitiveBreakRules: string[];
}

export interface AnimeVoiceCharacter {
  id: string;
  name: string;
  animeArchetype: string;
  tagline: string;
  pitch: number;
  rate: number;
  accent: string;
  motivationalPhrases: string[];
}

export interface ReelTemplate {
  id: string;
  title: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
  durationSeconds: number;
  hookStyle: string;
  overlayText: string;
  audioBpm: number;
  vibe: string;
}

export interface ReelPost {
  id: string;
  title: string;
  caption: string;
  platform: 'Instagram Reels' | 'TikTok' | 'YouTube Shorts';
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduledDate: string;
  views: number;
  likes: number;
  shares: number;
  templateUsed: string;
  colorGrade: string;
}

export interface PostureSessionStats {
  isActive: boolean;
  sessionMinutes: number;
  micromovements: number;
  macromovements: number;
  slouchWarnings: number;
  currentPostureStatus: 'Optimal' | 'Mild Slouch' | 'Severe Slouch' | 'Away';
  lastBreakReminder: string;
  focusScore: number;
  blinkCount: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  weeklyStudyHours: number;
  habitStreakDays: number;
  rank: number;
  isCurrentUser?: boolean;
}
