import {
  Habit,
  WorkoutLog,
  WorkoutGoal,
  BmiRecord,
  FitnessProfile,
  Transaction,
  Subscription,
  StudyTask,
  ReelTemplate,
  ReelPost,
  LeaderboardUser,
  ThemeMode
} from '../types';

const STORAGE_KEYS = {
  HABITS: 'apexlife_habits',
  FITNESS_PROFILE: 'apexlife_fitness_profile',
  WORKOUTS: 'apexlife_workouts',
  BMI_RECORDS: 'apexlife_bmi_records',
  TRANSACTIONS: 'apexlife_transactions',
  SUBSCRIPTIONS: 'apexlife_subscriptions',
  STUDY_TASKS: 'apexlife_study_tasks',
  STUDY_HISTORY_MINUTES: 'apexlife_study_history_mins',
  REEL_POSTS: 'apexlife_reel_posts',
  THEME: 'apexlife_theme',
  SECURITY: 'apexlife_security_settings',
  LEADERBOARD: 'apexlife_leaderboard',
  MONTHLY_BUDGET_CAP: 'apexlife_monthly_budget_cap'
};

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const generatePastMonthsDates = (countPerMonthMap: number[], offsetSeed: number): string[] => {
  const dates: string[] = [];
  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth();
  for (let m = 0; m < countPerMonthMap.length; m++) {
    const targetMonthDate = new Date(currentY, currentM - m, 1);
    const y = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth() + 1;
    const daysInMonth = new Date(y, month, 0).getDate();
    const limit = m === 0 ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    const count = Math.min(limit, countPerMonthMap[m]);

    for (let day = 1; day <= limit; day++) {
      if ((day + offsetSeed * 3 + m * 7) % 31 < count) {
        dates.push(`${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      }
    }
  }
  dates.push(getTodayDateStr());
  return Array.from(new Set(dates)).sort();
};

const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: '07:00 AM Cold Hydration & Sun Exposure',
    category: 'Health',
    frequency: 'daily',
    reminderTime: '07:00',
    targetCount: 1,
    unit: 'session',
    streak: 18,
    bestStreak: 24,
    completedDates: generatePastMonthsDates([26, 25, 24, 22, 20, 18], 1),
    history: [
      { date: '2026-10-24', value: 1 },
      { date: '2026-10-25', value: 1 },
      { date: '2026-10-26', value: 1 },
      { date: '2026-10-27', value: 1 },
      { date: getTodayDateStr(), value: 1 },
    ],
    color: '#38bdf8'
  },
  {
    id: 'habit-2',
    name: 'Morning 90-Min Deep Work (No Distractions)',
    category: 'Work',
    frequency: 'daily',
    reminderTime: '07:45',
    targetCount: 90,
    unit: 'mins',
    streak: 14,
    bestStreak: 21,
    completedDates: generatePastMonthsDates([25, 24, 22, 21, 19, 17], 2),
    history: [
      { date: '2026-10-25', value: 90 },
      { date: '2026-10-26', value: 110 },
      { date: '2026-10-27', value: 95 },
      { date: getTodayDateStr(), value: 90 }
    ],
    color: '#818cf8'
  },
  {
    id: 'habit-3',
    name: '10,000 Steps & Zone 2 Cardio Walk',
    category: 'Health',
    frequency: 'daily',
    reminderTime: '17:30',
    targetCount: 10000,
    unit: 'steps',
    streak: 9,
    bestStreak: 15,
    completedDates: generatePastMonthsDates([23, 22, 21, 19, 17, 15], 3),
    history: [
      { date: '2026-10-25', value: 11200 },
      { date: '2026-10-26', value: 10450 },
      { date: '2026-10-27', value: 12100 }
    ],
    color: '#34d399'
  },
  {
    id: 'habit-4',
    name: 'Daily 160g Protein Target Hit',
    category: 'Health',
    frequency: 'daily',
    reminderTime: '20:00',
    targetCount: 160,
    unit: 'grams',
    streak: 22,
    bestStreak: 30,
    completedDates: generatePastMonthsDates([28, 27, 26, 25, 23, 21], 4),
    history: [
      { date: '2026-10-25', value: 165 },
      { date: '2026-10-26', value: 170 },
      { date: '2026-10-27', value: 162 },
      { date: getTodayDateStr(), value: 165 }
    ],
    color: '#f59e0b'
  },
  {
    id: 'habit-5',
    name: 'Short-Form Reel Script & Edit',
    category: 'Work',
    frequency: 'weekdays',
    reminderTime: '15:00',
    targetCount: 1,
    unit: 'reel',
    streak: 6,
    bestStreak: 12,
    completedDates: generatePastMonthsDates([21, 20, 19, 17, 16, 14], 5),
    history: [
      { date: '2026-10-26', value: 1 },
      { date: '2026-10-27', value: 1 }
    ],
    color: '#f43f5e'
  },
  {
    id: 'habit-6',
    name: 'Evening Mindful Journal & Wind-Down',
    category: 'Personal',
    frequency: 'daily',
    reminderTime: '21:30',
    targetCount: 1,
    unit: 'session',
    streak: 11,
    bestStreak: 18,
    completedDates: generatePastMonthsDates([26, 25, 23, 21, 19, 17], 6),
    history: [
      { date: '2026-10-26', value: 1 },
      { date: '2026-10-27', value: 1 },
      { date: getTodayDateStr(), value: 1 }
    ],
    color: '#a855f7'
  }
];

export const DEFAULT_WORKOUT_GOALS: WorkoutGoal[] = [
  { id: 'goal-strength', category: 'Strength', targetMinutes: 180 },
  { id: 'goal-cardio', category: 'Cardio', targetMinutes: 120 },
  { id: 'goal-hiit', category: 'HIIT', targetMinutes: 60 },
  { id: 'goal-mobility', category: 'Mobility', targetMinutes: 60 },
  { id: 'goal-calisthenics', category: 'Calisthenics', targetMinutes: 60 }
];

const INITIAL_FITNESS_PROFILE: FitnessProfile = {
  weightKg: 73.5,
  heightCm: 178,
  age: 25,
  gender: 'Male',
  activityLevel: 'High (4-5 intense sessions/week)',
  bodyType: 'Mesomorph',
  goal: 'Hypertrophy & Muscle Gain',
  dailyStepsTarget: 10000,
  dailyCaloriesTarget: 2600,
  todaySteps: 8420,
  todayCaloriesBurned: 740,
  todayActiveHeartRate: 134,
  workoutGoals: DEFAULT_WORKOUT_GOALS
};

const INITIAL_WORKOUTS: WorkoutLog[] = [
  {
    id: 'w-1',
    date: getTodayDateStr(),
    title: 'Heavy Incline Bench & Delts Overload',
    intensity: 'High',
    durationMinutes: 58,
    caloriesBurned: 520,
    avgHeartRate: 138,
    peakHeartRate: 169,
    category: 'Strength',
    exercises: ['Barbell Incline Press (4x8 @ 85kg)', 'DB Lateral Raises (4x15 @ 14kg)', 'Weighted Dips (3x10 @ +15kg)', 'Face Pulls (4x15)']
  },
  {
    id: 'w-2',
    date: '2026-10-28',
    title: '5km Tempo Run & Sprint Intervals',
    intensity: 'Extreme',
    durationMinutes: 62,
    caloriesBurned: 610,
    avgHeartRate: 154,
    peakHeartRate: 182,
    category: 'Cardio',
    exercises: ['1km Warm-Up Jog', '4x800m Tempo Threshold (3:45/km)', '6x100m Full Sprints', 'Cool-Down Walk']
  },
  {
    id: 'w-3',
    date: '2026-10-27',
    title: 'Kinetic Squats & Hamstring Loading',
    intensity: 'Extreme',
    durationMinutes: 65,
    caloriesBurned: 640,
    avgHeartRate: 145,
    peakHeartRate: 178,
    category: 'Strength',
    exercises: ['Barbell Back Squats (5x5 @ 125kg)', 'Romanian Deadlifts (4x8 @ 110kg)', 'Bulgarian Split Squats (3x10)', 'Standing Calves (4x15)']
  },
  {
    id: 'w-4',
    date: '2026-10-25',
    title: 'Zone 2 Aerobic Base & Core Density',
    intensity: 'Moderate',
    durationMinutes: 45,
    caloriesBurned: 390,
    avgHeartRate: 129,
    peakHeartRate: 142,
    category: 'Cardio',
    exercises: ['Incline Treadmill Walk 12% @ 5km/h (35min)', 'Hanging Leg Raises (4x12)', 'Ab Wheel Rollouts (3x10)']
  },
  {
    id: 'w-5',
    date: '2026-10-24',
    title: 'Full Body Mobility & Spinal Decompression',
    intensity: 'Low',
    durationMinutes: 28,
    caloriesBurned: 180,
    avgHeartRate: 104,
    peakHeartRate: 118,
    category: 'Mobility',
    exercises: ["World's Greatest Stretch (3 sets)", 'Couch Stretch (2m/leg)', 'Thoracic Foam Roll & Extension', 'Dead Hangs (3x60s)']
  },
  {
    id: 'w-6',
    date: '2026-10-23',
    title: 'Weighted Pull-Ups & Upper Back Density',
    intensity: 'High',
    durationMinutes: 52,
    caloriesBurned: 490,
    avgHeartRate: 136,
    peakHeartRate: 165,
    category: 'Strength',
    exercises: ['Weighted Neutral Pull-Ups (4x6 @ +20kg)', 'Barbell Chest-Supported Row (4x8 @ 75kg)', 'Single-Arm DB Row (3x10 @ 36kg)', 'Incline DB Curls (3x12)']
  },
  {
    id: 'w-7',
    date: '2026-10-21',
    title: 'Kettlebell Complex & Tabata Density',
    intensity: 'Extreme',
    durationMinutes: 50,
    caloriesBurned: 580,
    avgHeartRate: 158,
    peakHeartRate: 180,
    category: 'HIIT',
    exercises: ['KB Clean & Press (5x10 @ 24kg)', 'Kettlebell Snatches (4x15/arm)', 'Burpee Box Jumps (5 rounds)', 'Assault Bike Sprint Finisher']
  },
  {
    id: 'w-8',
    date: '2026-10-20',
    title: 'Standing Overhead Press & Shoulder Hypertrophy',
    intensity: 'High',
    durationMinutes: 48,
    caloriesBurned: 440,
    avgHeartRate: 132,
    peakHeartRate: 160,
    category: 'Strength',
    exercises: ['Standing Barbell OHP (4x6 @ 60kg)', 'Cable Lateral Raises (5x15)', 'Rear Delt Reverse Flyes (4x15)', 'Overhead Cable Triceps (3x12)']
  },
  {
    id: 'w-9',
    date: '2026-10-18',
    title: 'Zone 2 Ruck & Weighted Calisthenics',
    intensity: 'Moderate',
    durationMinutes: 42,
    caloriesBurned: 380,
    avgHeartRate: 128,
    peakHeartRate: 140,
    category: 'Cardio',
    exercises: ['15kg Weighted Vest Ruck Walk (30 min)', 'Parallel Bar Dips (4x12)', 'Dragon Flags (3x8)']
  },
  {
    id: 'w-10',
    date: '2026-10-16',
    title: 'Conventional Deadlifts & Kinetic Power',
    intensity: 'Extreme',
    durationMinutes: 68,
    caloriesBurned: 670,
    avgHeartRate: 148,
    peakHeartRate: 184,
    category: 'Strength',
    exercises: ['Deadlifts (5x3 @ 160kg)', 'Barbell Hip Thrusts (4x10 @ 140kg)', 'Nordic Hamstring Curls (3x8)', 'Farmers Walks (4x50m)']
  },
  {
    id: 'w-11',
    date: '2026-10-15',
    title: 'Gymnastic Ring Strength & Muscle-Up Drills',
    intensity: 'High',
    durationMinutes: 46,
    caloriesBurned: 420,
    avgHeartRate: 134,
    peakHeartRate: 162,
    category: 'Calisthenics',
    exercises: ['Ring Muscle-Up Transitions (4x3)', 'Ring Dips with Turnout (4x8)', 'L-Sit Holds (4x20s)', 'Tuck Planche Leans (4x15s)']
  },
  {
    id: 'w-12',
    date: '2026-10-13',
    title: 'Joint Mobility & Deep Fascial Stretching',
    intensity: 'Low',
    durationMinutes: 25,
    caloriesBurned: 150,
    avgHeartRate: 98,
    peakHeartRate: 112,
    category: 'Mobility',
    exercises: ['Hip 90/90 Internal/External Rotations', 'Ankle Dorsiflexion Mobilization', 'Pigeon Pose (3m/side)', 'Cat-Cow (20 reps)']
  },
  {
    id: 'w-13',
    date: '2026-10-11',
    title: 'Chest Hypertrophy & Kinetic Flyes',
    intensity: 'High',
    durationMinutes: 54,
    caloriesBurned: 490,
    avgHeartRate: 135,
    peakHeartRate: 166,
    category: 'Strength',
    exercises: ['Flat Dumbbell Press (4x8 @ 38kg)', 'Incline Machine Press (3x10)', 'Cable Crossover Low-to-High (4x15)', 'Skull Crushers (3x12)']
  },
  {
    id: 'w-14',
    date: '2026-10-09',
    title: 'Assault Bike Tabata & Lactate Clearing',
    intensity: 'Extreme',
    durationMinutes: 40,
    caloriesBurned: 530,
    avgHeartRate: 160,
    peakHeartRate: 185,
    category: 'HIIT',
    exercises: ['10 min Warmup @ 50 RPM', '8 rounds 20s Max Sprint / 10s Rest', '4x500m Row Sprints', 'Active flush walk']
  },
  {
    id: 'w-15',
    date: '2026-10-07',
    title: 'Front Squats & Quad Hypertrophy',
    intensity: 'Extreme',
    durationMinutes: 62,
    caloriesBurned: 620,
    avgHeartRate: 144,
    peakHeartRate: 176,
    category: 'Strength',
    exercises: ['Barbell Front Squats (4x6 @ 100kg)', 'Leg Press (4x12 @ 240kg)', 'Walking DB Lunges (3x12/leg)', 'Seated Calf Raises (4x15)']
  },
  {
    id: 'w-16',
    date: '2026-10-04',
    title: 'Aerobic Trail Run & Hill Bounds',
    intensity: 'High',
    durationMinutes: 52,
    caloriesBurned: 540,
    avgHeartRate: 146,
    peakHeartRate: 172,
    category: 'Cardio',
    exercises: ['7.5km Outdoor Trail Run', '5x60m Hill Sprint Bounds', 'Static Quad & Calf Cool-Down']
  },
  {
    id: 'w-17',
    date: '2026-10-02',
    title: 'Shoulder Pre-hab & Anterior Chain Power',
    intensity: 'Moderate',
    durationMinutes: 38,
    caloriesBurned: 350,
    avgHeartRate: 126,
    peakHeartRate: 152,
    category: 'Strength',
    exercises: ['Arnold Press (3x10)', 'Plate Halos (3x12)', 'Face Pulls with External Rotation (4x15)', 'Paloff Press (3x15)']
  }
];

const INITIAL_BMI_RECORDS: BmiRecord[] = [
  { id: 'b-1', date: '2026-06-15', weightKg: 78.0, heightCm: 178, bmi: 24.6, bodyFatPct: 18.5, notes: 'Initiated recomposition phase' },
  { id: 'b-2', date: '2026-07-20', weightKg: 76.8, heightCm: 178, bmi: 24.2, bodyFatPct: 17.2, notes: 'Improved conditioning & steps' },
  { id: 'b-3', date: '2026-08-18', weightKg: 75.4, heightCm: 178, bmi: 23.8, bodyFatPct: 15.8, notes: 'Solid waist reduction' },
  { id: 'b-4', date: '2026-09-22', weightKg: 74.2, heightCm: 178, bmi: 23.4, bodyFatPct: 14.7, notes: 'Shoulder-to-waist ratio improved' },
  { id: 'b-5', date: '2026-10-26', weightKg: 73.5, heightCm: 178, bmi: 23.2, bodyFatPct: 14.1, notes: 'Lean vascularity, high energy' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't-1', date: '2026-10-01', title: 'Tech Senior Contract Payout', amount: 4800, type: 'income', category: 'Salary' },
  { id: 't-2', date: '2026-10-02', title: 'Modern Studio Apartment', amount: 1450, type: 'expense', category: 'Housing' },
  { id: 't-3', date: '2026-10-05', title: 'Organic Whole Foods & High-Protein Groceries', amount: 480, type: 'expense', category: 'Nutrition' },
  { id: 't-4', date: '2026-10-08', title: 'Equinox Elite Gym Pass', amount: 160, type: 'expense', category: 'Fitness' },
  { id: 't-5', date: '2026-10-14', title: 'Cloud Compute & AI API Subscriptions', amount: 95, type: 'expense', category: 'Tech & Tools' },
  { id: 't-6', date: '2026-10-18', title: 'Video Editing Freelance Gig', amount: 920, type: 'income', category: 'Freelance' },
  { id: 't-7', date: '2026-10-22', title: 'Cognitive Ergonomic Chair Upgrade', amount: 320, type: 'expense', category: 'Tech & Tools' },
  { id: 't-8', date: '2026-10-26', title: 'Supplements (Creatine, Whey Isolate, Omega-3)', amount: 110, type: 'expense', category: 'Nutrition' }
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 's-1', serviceName: 'GitHub Copilot Enterprise', amount: 19, billingCycle: 'monthly', renewalDayOfMonth: 5, category: 'Tech', active: true, notes: 'Core code acceleration' },
  { id: 's-2', serviceName: 'Equinox Gym Pass', amount: 160, billingCycle: 'monthly', renewalDayOfMonth: 8, category: 'Fitness', active: true, notes: 'Sauna + Heavy lifting racks' },
  { id: 's-3', serviceName: 'Spotify HiFi & Podcasts', amount: 11.99, billingCycle: 'monthly', renewalDayOfMonth: 12, category: 'Entertainment', active: true, notes: 'Binaural beats & lofi focus' },
  { id: 's-4', serviceName: 'Midjourney / Runway Studio', amount: 30, billingCycle: 'monthly', renewalDayOfMonth: 19, category: 'Creative Tools', active: true, notes: 'Reel B-roll creation' },
  { id: 's-5', serviceName: 'Supabase Cloud Pro', amount: 25, billingCycle: 'monthly', renewalDayOfMonth: 24, category: 'Tech', active: true, notes: 'Backend db clusters' }
];

const INITIAL_STUDY_TASKS: StudyTask[] = [
  { id: 'st-1', title: 'Deconstruct Distributed Consensus (Raft / Paxos)', timeSlot: '07:30 AM', durationMinutes: 90, isMorningPriority: true, completed: true, subject: 'Distributed Systems', difficulty: 'High Friction' },
  { id: 'st-2', title: 'Active Recall Drill: Dynamic Programming Graphs', timeSlot: '09:30 AM', durationMinutes: 60, isMorningPriority: true, completed: false, subject: 'Algorithms', difficulty: 'High Friction' },
  { id: 'st-3', title: 'Deep Review: TypeScript Type Variance & Monads', timeSlot: '11:00 AM', durationMinutes: 45, isMorningPriority: false, completed: false, subject: 'Software Architecture', difficulty: 'Medium' },
  { id: 'st-4', title: 'Anki Flashcard Deck: System Design Patterns', timeSlot: '16:00 PM', durationMinutes: 30, isMorningPriority: false, completed: false, subject: 'Spaced Repetition', difficulty: 'Light' }
];

const INITIAL_REEL_TEMPLATES: ReelTemplate[] = [
  {
    id: 'tmpl-1',
    title: '⚡ Fast-Hook 3s Pattern Interrupt',
    aspectRatio: '9:16',
    durationSeconds: 24,
    hookStyle: 'Bold Center Punch Text with 0.4s Strobe',
    overlayText: 'STOP LOSING YOUR MORNINGS: The 3-Step Protocol',
    audioBpm: 128,
    vibe: 'Cyberpunk & Aggressive Motivation'
  },
  {
    id: 'tmpl-2',
    title: '🧘 Aesthetic Lofi Day-In-The-Life',
    aspectRatio: '9:16',
    durationSeconds: 38,
    hookStyle: 'Soft Cinematic Tilt with Grain Overlay',
    overlayText: 'How I hit 160g protein & 4 hours deep work every day',
    audioBpm: 84,
    vibe: 'Minimalist Clean Living'
  },
  {
    id: 'tmpl-3',
    title: '🔥 High-Density Educational Carousel-Reel',
    aspectRatio: '9:16',
    durationSeconds: 30,
    hookStyle: 'Question Hook with Visual Diagram Callout',
    overlayText: 'The Exact Study Plan That Got Me Top 1%',
    audioBpm: 120,
    vibe: 'High Authority & Masterclass'
  }
];

const INITIAL_REEL_POSTS: ReelPost[] = [
  {
    id: 'rp-1',
    title: 'Why 99% Of People Fail Their Habits in 14 Days',
    caption: 'It is not willpower. It is environmental design. Swipe to see the 3 rules that fix your friction points. ⚡ #discipline #habits #biohacking',
    platform: 'Instagram Reels',
    status: 'Published',
    scheduledDate: '2026-10-24 18:30',
    views: 48200,
    likes: 5410,
    shares: 890,
    templateUsed: '⚡ Fast-Hook 3s Pattern Interrupt',
    colorGrade: 'Teal & Orange Filmic'
  },
  {
    id: 'rp-2',
    title: 'Morning Deep Work Routine (No Phone Before 09:00)',
    caption: 'How my cognitive output tripled by delaying morning dopamine. Here is the full schedule breakdown 👇 #deepwork #focus #studygram',
    platform: 'TikTok',
    status: 'Published',
    scheduledDate: '2026-10-26 12:00',
    views: 89400,
    likes: 12300,
    shares: 2150,
    templateUsed: '🧘 Aesthetic Lofi Day-In-The-Life',
    colorGrade: 'Golden Hour Glow'
  },
  {
    id: 'rp-3',
    title: 'High Protein Meal Prep Under 25 Minutes (160g Total)',
    caption: 'Never skip protein goals again. Save this recipe for Sunday prep! 🥩🥦 #fitness #nutrition #protein #hypertrophy',
    platform: 'YouTube Shorts',
    status: 'Scheduled',
    scheduledDate: '2026-10-29 17:45',
    views: 0,
    likes: 0,
    shares: 0,
    templateUsed: '🔥 High-Density Educational Carousel-Reel',
    colorGrade: 'Vibrant Punch LUT'
  }
];

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u-1', name: 'Tanmay (You)', avatar: '⚡', weeklyStudyHours: 28.5, habitStreakDays: 18, rank: 2, isCurrentUser: true },
  { id: 'u-2', name: 'Dr. Marcus Vance', avatar: '🧠', weeklyStudyHours: 32.0, habitStreakDays: 45, rank: 1 },
  { id: 'u-3', name: 'Elena Rostova', avatar: '🚀', weeklyStudyHours: 24.2, habitStreakDays: 14, rank: 3 },
  { id: 'u-4', name: 'Kenji Takahashi', avatar: '⚔️', weeklyStudyHours: 21.0, habitStreakDays: 29, rank: 4 },
  { id: 'u-5', name: 'Sarah Chen', avatar: '🌸', weeklyStudyHours: 19.5, habitStreakDays: 12, rank: 5 }
];

// LocalStorage helpers with safe fallbacks
export const Storage = {
  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      const habitsList: Habit[] = data ? JSON.parse(data) : INITIAL_HABITS;
      return habitsList.map((h) => {
        let cat = h.category;
        if (cat === 'health') cat = 'Health';
        else if (cat === 'study' || cat === 'creation') cat = 'Work';
        else if (cat === 'discipline' || cat === 'mindset') cat = 'Personal';
        return {
          ...h,
          category: cat || 'Personal'
        };
      });
    } catch {
      return INITIAL_HABITS;
    }
  },
  saveHabits(habits: Habit[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getFitnessProfile(): FitnessProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FITNESS_PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.workoutGoals || !Array.isArray(parsed.workoutGoals) || parsed.workoutGoals.length === 0) {
          parsed.workoutGoals = DEFAULT_WORKOUT_GOALS;
        }
        return parsed;
      }
      return INITIAL_FITNESS_PROFILE;
    } catch {
      return INITIAL_FITNESS_PROFILE;
    }
  },
  saveFitnessProfile(profile: FitnessProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.FITNESS_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getWorkouts(): WorkoutLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : INITIAL_WORKOUTS;
    } catch {
      return INITIAL_WORKOUTS;
    }
  },
  saveWorkouts(workouts: WorkoutLog[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getBmiRecords(): BmiRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BMI_RECORDS);
      return data ? JSON.parse(data) : INITIAL_BMI_RECORDS;
    } catch {
      return INITIAL_BMI_RECORDS;
    }
  },
  saveBmiRecords(records: BmiRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BMI_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },
  saveTransactions(txs: Transaction[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getSubscriptions(): Subscription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return data ? JSON.parse(data) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  },
  saveSubscriptions(subs: Subscription[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getMonthlyBudgetCap(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGET_CAP);
      return data ? Number(data) : 3200;
    } catch {
      return 3200;
    }
  },
  saveMonthlyBudgetCap(cap: number) {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGET_CAP, String(cap));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getStudyTasks(): StudyTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_TASKS);
      return data ? JSON.parse(data) : INITIAL_STUDY_TASKS;
    } catch {
      return INITIAL_STUDY_TASKS;
    }
  },
  saveStudyTasks(tasks: StudyTask[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getReelTemplates(): ReelTemplate[] {
    return INITIAL_REEL_TEMPLATES;
  },

  getReelPosts(): ReelPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REEL_POSTS);
      return data ? JSON.parse(data) : INITIAL_REEL_POSTS;
    } catch {
      return INITIAL_REEL_POSTS;
    }
  },
  saveReelPosts(posts: ReelPost[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REEL_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  getTheme(): ThemeMode {
    try {
      return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'obsidian';
    } catch {
      return 'obsidian';
    }
  },
  saveTheme(theme: ThemeMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Theme save error:', e);
    }
  },

  getLeaderboard(): LeaderboardUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      return data ? JSON.parse(data) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  },

  exportFullBackup(): string {
    const backup = {
      habits: this.getHabits(),
      fitnessProfile: this.getFitnessProfile(),
      workouts: this.getWorkouts(),
      bmiRecords: this.getBmiRecords(),
      transactions: this.getTransactions(),
      subscriptions: this.getSubscriptions(),
      studyTasks: this.getStudyTasks(),
      reelPosts: this.getReelPosts(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits) this.saveHabits(data.habits);
      if (data.fitnessProfile) this.saveFitnessProfile(data.fitnessProfile);
      if (data.workouts) this.saveWorkouts(data.workouts);
      if (data.bmiRecords) this.saveBmiRecords(data.bmiRecords);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.subscriptions) this.saveSubscriptions(data.subscriptions);
      if (data.studyTasks) this.saveStudyTasks(data.studyTasks);
      if (data.reelPosts) this.saveReelPosts(data.reelPosts);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }
};
