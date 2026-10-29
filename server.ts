import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { findAvailablePort } from './src/server-utils';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Initialize Google Gemini AI SDK if key available
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI();
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. API: Study Plan Generator
app.post('/api/ai/study-plan', async (req, res) => {
  const { subject, currentLevel, gaps, weeklyHours, targetGoal } = req.body;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an elite cognitive learning coach and neuro-productivity expert.
Create a personalized, rigorous study plan and daily routine adjustment for a student.
Input details:
- Subject/Topic: ${subject || 'Computer Science & Mathematics'}
- Current Level / Progress: ${currentLevel || 'Intermediate'}
- Identified Gaps / Difficulties: ${gaps || 'Retaining complex algorithms and maintaining morning focus'}
- Available Hours / Week: ${weeklyHours || 20} hours
- Target Goal: ${targetGoal || 'Mastery and exam readiness in 4 weeks'}

Format the response strictly as valid JSON with no markdown wrapping (or raw JSON object) matching:
{
  "summary": "High-impact summary of strategy",
  "morningPriorityRoutine": ["Step 1...", "Step 2...", "Step 3..."],
  "weeklyMilestones": [
    { "week": 1, "focus": "Core foundations", "deliverable": "Project or quiz target", "keyConcepts": ["..."] },
    { "week": 2, "focus": "Bridge gaps", "deliverable": "Timed exercises", "keyConcepts": ["..."] },
    { "week": 3, "focus": "Advanced integration", "deliverable": "Mini-capstone", "keyConcepts": ["..."] },
    { "week": 4, "focus": "Consolidation & recall", "deliverable": "Simulated exam/review", "keyConcepts": ["..."] }
  ],
  "optimalStudySchedule": [
    { "timeBlock": "07:30 - 09:30", "phase": "Peak Cognitive Window", "task": "Deep focus on hardest concept", "technique": "Active Recall / Feynman" },
    { "timeBlock": "09:30 - 09:45", "phase": "Cognitive Refresh", "task": "Hydration, optic flow walk, posture reset", "technique": "No dopamine scroll" },
    { "timeBlock": "10:00 - 11:30", "phase": "Deliberate Practice", "task": "Problem sets and gap correction", "technique": "Timed drills" },
    { "timeBlock": "16:00 - 17:00", "phase": "Spaced Review", "task": "Flashcard review and summary notes", "technique": "Spaced Repetition" }
  ],
  "gapRemediation": [
    { "gap": "...", "fix": "...", "resourceHint": "..." }
  ],
  "cognitiveBreakRules": [
    "Every 50 minutes: 7-minute eye rest (20-20-20 rule) and neck release",
    "Post 2 hours deep work: 20-minute movement break away from screens",
    "Never check social media during micro-breaks to preserve cognitive capacity"
  ]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      return res.json(JSON.parse(text));
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local cognitive engine:', err?.message);
    }
  }

  // Fallback high-fidelity algorithmic plan
  return res.json({
    summary: `Personalized 4-Week Hyper-Focus Roadmap tailored for ${subject || 'your core curriculum'}. Designed with morning cognitive prime-state mechanics to eliminate ${gaps || 'knowledge gaps'} with highest efficiency.`,
    morningPriorityRoutine: [
      '06:45 AM: Cold water hydration + sunlight exposure (sets circadian alertness spike).',
      '07:15 AM - 09:00 AM: Deep Work Block 1 on the highest-friction chapter before any notifications or email.',
      '09:00 AM: 15-minute mobility reset and ergonomic decompression.'
    ],
    weeklyMilestones: [
      {
        week: 1,
        focus: `Deconstruct ${subject || 'Core Concepts'} & Isolate Misconceptions`,
        deliverable: 'Diagnostic audit of all blindspots with active recall index cards',
        keyConcepts: ['Fundamental proofs & definitions', 'Mental model mapping', 'Error pattern journal']
      },
      {
        week: 2,
        focus: 'Bridging Understanding Gaps & Targeted Synthesis',
        deliverable: 'Solve 20 high-difficulty practice questions under unassisted conditions',
        keyConcepts: ['Targeted drills on weak formulas', 'Feynman technique audio summaries', 'Step-by-step validation']
      },
      {
        week: 3,
        focus: 'Speed, Fluency & Complex System Integration',
        deliverable: 'Timed 90-minute problem set simulation with error threshold < 5%',
        keyConcepts: ['Cross-chapter connection heuristics', 'Time-management constraints', 'Cognitive resilience under stress']
      },
      {
        week: 4,
        focus: 'Spaced Consolidation & Peer Explanations',
        deliverable: 'Comprehensive portfolio review / mock exam mastery score >= 92%',
        keyConcepts: ['Full domain synthesis', 'Rapid review mind-maps', 'Final confidence audit']
      }
    ],
    optimalStudySchedule: [
      { timeBlock: '07:30 - 09:15', phase: 'Morning Peak Focus', task: `Deep dive into difficult ${subject || 'material'}`, technique: 'Pomodoro 50/10' },
      { timeBlock: '09:15 - 09:35', phase: 'Optimal Restorative Break', task: 'Hydration & Posture Stretch', technique: '20-20-20 Optical Rest' },
      { timeBlock: '10:00 - 11:30', phase: 'Active Problem Synthesis', task: 'Untimed practice problems & error dissection', technique: 'Feynman Technique' },
      { timeBlock: '16:00 - 17:00', phase: 'Spaced Memory Lock', task: 'Leitner flashcards and daily recap log', technique: 'Spaced Repetition' }
    ],
    gapRemediation: [
      { gap: gaps || 'Concept retention under pressure', fix: 'Translate complex derivations into 3 plain English bullet points before writing any equations.', resourceHint: 'First principles derivation worksheets' },
      { gap: 'Afternoon mental fatigue', fix: 'Shift rote reading and flashcards to afternoons; preserve 08:00-11:00 AM strictly for challenging synthesis.', resourceHint: 'Ultradian rhythm time blocking' }
    ],
    cognitiveBreakRules: [
      'The 50/10 Protocol: 50 minutes high-focus immersion followed by 10 minutes screen-free recharge.',
      'Circadian alignment: Avoid blue-light bombardment during breaks; gaze at distant objects (>20ft).',
      'Hydration cadence: Drink 250ml electrolyte/water every 90 minutes to maintain neural conduction velocity.'
    ]
  });
});

// 2. API: Real-Time Productivity & Posture Audit
app.post('/api/ai/productivity-audit', async (req, res) => {
  const { sessionMinutes, totalMovements, slouchCount, focusScore, activeWindows, fatigueRating } = req.body;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a real-time AI ergonomic and cognitive productivity monitor.
Analyze this work session:
- Active duration: ${sessionMinutes || 45} minutes
- Total micromovements detected: ${totalMovements || 12}
- Slouch / poor posture occurrences: ${slouchCount || 3}
- Computed focus score: ${focusScore || 82}%
- Active workflow tasks: ${activeWindows || 'Code editor, documentation, terminal'}
- Fatigue self-rating: ${fatigueRating || 'Moderate'}

Provide actionable feedback in valid JSON:
{
  "productivityState": "High / Flow State / Fatigue Impending / Distracted",
  "postureVerdict": "Ergonomic assessment & spine alignment feedback",
  "immediateAction": "Single immediate command for the user (e.g. Chin tuck & stretch)",
  "cognitiveBatteryPct": 78,
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "alarmToneRecommended": "Energetic / Gentle / Sensei Focus / Cyber Protocol"
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      return res.json(JSON.parse(text));
    } catch (err: any) {
      console.warn('Gemini productivity audit error:', err?.message);
    }
  }

  // Fallback intelligent evaluation
  const slouchNum = Number(slouchCount) || 0;
  const scoreNum = Number(focusScore) || 85;
  const state = scoreNum >= 85 ? (slouchNum > 4 ? 'Flow State (Posture Degraded)' : 'Optimal Deep Flow') : 'Distraction Risk';

  return res.json({
    productivityState: state,
    postureVerdict: slouchNum > 3
      ? 'Forward head tilt detected (>18° incline). Cervical spine load increased by ~12kg. Immediate scapular retraction recommended.'
      : 'Spine vertical alignment stable. Scapulae relaxed and neutral.',
    immediateAction: slouchNum > 2 ? 'Perform 3 deep diaphragmatic breaths and draw your chin gently back toward your spine.' : 'Maintain current visual plane at eye level.',
    cognitiveBatteryPct: Math.max(30, Math.min(100, Math.round(100 - (Number(sessionMinutes) || 40) * 0.45))),
    recommendations: [
      'Level monitor height: ensure top 1/3rd of the display aligns directly with horizontal eye gaze.',
      'Micro-break in 12 minutes: Stand up and walk 60 steps to re-oxygenate prefrontal cortex.',
      'Blink rate check: Consciously blink 10 times to rebuild the ocular tear film.'
    ],
    alarmToneRecommended: scoreNum < 70 ? 'Sensei Focus - High Alert' : 'Zen Minimal Bell'
  });
});

// 3. API: Personalized Protein & Workout Routine Recommendation
app.post('/api/ai/fitness-recommendation', async (req, res) => {
  const { weightKg, heightCm, age, gender, activityLevel, bodyType, goal, weeklyDays } = req.body;

  const weight = parseFloat(weightKg) || 72;
  const height = parseFloat(heightCm) || 178;
  const bmiVal = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an elite sports scientist, clinical dietitian, and kinesiology expert.
Calculate and design an exact, personalized fitness & nutritional protocol.
Client profile:
- Weight: ${weight} kg
- Height: ${height} cm
- BMI: ${bmiVal}
- Age: ${age || 26}
- Gender: ${gender || 'Not specified'}
- Activity Level: ${activityLevel || 'Moderate (gym 3-4 days/week)'}
- Body Type: ${bodyType || 'Mesomorph / Balanced'}
- Primary Goal: ${goal || 'Lean muscle gain & metabolic conditioning'}
- Available Workout Days: ${weeklyDays || 4} days/week

Return valid JSON:
{
  "bmiAnalysis": "Precise classification and health context",
  "dailyCalorieTarget": 2450,
  "dailyProteinGrams": 155,
  "dailyProteinCalculationDetail": "Explain formula used (e.g. 2.0g/kg lean mass for hypertrophy)",
  "macroBreakdown": { "proteinPct": 30, "carbsPct": 45, "fatsPct": 25 },
  "bodyTypeStrategy": "Specific insights for ${bodyType}",
  "weeklyWorkoutPlan": [
    { "day": "Day 1", "title": "Upper Body Hypertrophy & Power", "duration": "55 min", "intensity": "High", "exercises": ["Barbell Incline Press (4x8)", "Pull-Ups (4x8-10)", "Overhead Dumbbell Press (3x10)", "Face Pulls (3x15)"] },
    { "day": "Day 2", "title": "Lower Body Kinetic Drive", "duration": "50 min", "intensity": "High", "exercises": ["Romanian Deadlift (4x8)", "Barbell Back Squats (4x6-8)", "Walking Lunges (3x12/leg)", "Standing Calf Raises (4x15)"] },
    { "day": "Day 3", "title": "Active Recovery & Core Mobility", "duration": "35 min", "intensity": "Low-Moderate", "exercises": ["Zone 2 Incline Walk (25 min)", "Hanging Leg Raises (3x12)", "World's Greatest Stretch (3 rounds)"] },
    { "day": "Day 4", "title": "Full Body Metabolic Density", "duration": "50 min", "intensity": "Very High", "exercises": ["Kettlebell Swings (4x15)", "Dumbbell Thrusters (4x10)", "Chest-Supported Row (3x12)", "Dips (3x12)"] }
  ],
  "cardioAndHeartRateTargets": {
    "zone2RangeBpm": "120 - 138 bpm (Aerobic base building)",
    "zone4PeakBpm": "162 - 176 bpm (Anaerobic threshold)"
  },
  "dietaryTips": [
    "Distribute protein across 4 meals of 35-40g each for optimal MPS (Muscle Protein Synthesis)",
    "Consume 500ml water with electrolytes first thing in the morning",
    "Creatine monohydrate 5g daily for cellular ATP saturation"
  ]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      return res.json(JSON.parse(text));
    } catch (err: any) {
      console.warn('Gemini fitness recommendation error:', err?.message);
    }
  }

  // Fallback sports science calculation
  let proteinFactor = 2.0; // g per kg
  if (goal === 'Fat Loss & Preservation') proteinFactor = 2.2;
  if (goal === 'Endurance & Stamina') proteinFactor = 1.7;
  const proteinTarget = Math.round(weight * proteinFactor);
  const basalMetabolicRate = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
  const calorieTarget = Math.round(basalMetabolicRate * 1.55 + (goal === 'Muscle Gain' ? 300 : goal === 'Fat Loss' ? -400 : 0));

  return res.json({
    bmiAnalysis: bmiVal < 18.5
      ? 'Underweight category. Recommend caloric surplus and resistance training to build lean structural tissue.'
      : bmiVal < 25
      ? 'Optimal normal BMI range. Excellent cardiovascular baseline; ideal candidate for recomposition and progressive overload.'
      : bmiVal < 30
      ? 'Overweight category. Recommend moderate caloric deficit with high protein retention to preserve lean mass while mobilizing adipose tissue.'
      : 'Obesity threshold. Focus on joint-friendly low-impact Zone 2 cardio, progressive strength movements, and nutritional regulation.',
    dailyCalorieTarget: calorieTarget,
    dailyProteinGrams: proteinTarget,
    dailyProteinCalculationDetail: `${proteinFactor}g per kg of body mass based on ${goal || 'Athletic Performance & Muscle Synthesis'} requirements.`,
    macroBreakdown: { proteinPct: 30, carbsPct: 45, fatsPct: 25 },
    bodyTypeStrategy: `${bodyType || 'Athletic Balanced'}: Responds exceptionally well to compound barbell/dumbbell movements paired with 2 weekly Zone 2 cardio sessions.`,
    weeklyWorkoutPlan: [
      { day: 'Day 1 - Push & Anterior Chain', title: 'Chest, Shoulders & Triceps Strength', duration: '50 min', intensity: 'High', exercises: ['Incline Dumbbell Press (4x8-10)', 'Overhead Barbell Press (3x8)', 'Cable Lateral Raises (4x15)', 'Tricep Overhead Rope Extension (3x12)'] },
      { day: 'Day 2 - Pull & Posterior Chain', title: 'Upper Back, Lats & Biceps', duration: '50 min', intensity: 'High', exercises: ['Neutral-Grip Lat Pulldown (4x10)', 'Barbell Chest-Supported Row (4x8)', 'Rear Delt Flyes (3x15)', 'Incline Dumbbell Curls (3x12)'] },
      { day: 'Day 3 - Lower Body & Core', title: 'Quads, Hamstrings & Kinetic Power', duration: '55 min', intensity: 'Very High', exercises: ['Barbell Back Squats (4x6-8)', 'Romanian Deadlifts (4x8-10)', 'Bulgarian Split Squats (3x10/side)', 'Hanging Knee Raises (3x15)'] },
      { day: 'Day 4 - Full Body Conditioning', title: 'Athletic Agility & Zone 2 Stamina', duration: '45 min', intensity: 'Moderate-High', exercises: ['Kettlebell Clean & Press (4x10)', 'Assault Bike / Rowing Intervals (8x30s on/30s off)', 'Farmer Carries (4x40m)', 'Thoracic Foam Rolling & Stretches'] }
    ],
    cardioAndHeartRateTargets: {
      zone2RangeBpm: '122 - 139 bpm (Fat oxidation & mitochondrial density)',
      zone4PeakBpm: '164 - 178 bpm (Lactate threshold intervals)'
    },
    dietaryTips: [
      `Consume ${Math.round(proteinTarget / 4)}g protein every 3.5 to 4 hours to maximize muscle protein synthesis.`,
      'Drink at least 3.2L of water daily, adding Himalayan salt or electrolytes during heavy workout days.',
      'Prioritize complex carbohydrates (oats, sweet potatoes, brown rice) 90 minutes prior to high-intensity training.'
    ]
  });
});

// 4. API: Reel Studio AI Assistant
app.post('/api/ai/reel-assist', async (req, res) => {
  const { concept, niche, targetPlatform, colorStyle } = req.body;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a viral short-form video strategist and master colorist for Instagram Reels, TikTok, and YouTube Shorts.
Creative brief:
- Concept / Topic: ${concept || 'Daily 5am productive habit routine'}
- Niche: ${niche || 'Fitness & Self-Development'}
- Target Platform: ${targetPlatform || 'Instagram Reels & TikTok'}
- Desired Color Grade / Look: ${colorStyle || 'Cinematic High-Contrast Cyber Dark'}

Generate creative direction in valid JSON:
{
  "viralHookScript": "Exact 3-second hook voiceover or text overlay",
  "hookRetentionTip": "Visual cut or pattern interrupt recommendation for second 0-3",
  "recommendedColorLut": "Name of color profile (e.g. Cyber Tokyo, Golden Sunset, Minimal Obsidian, Punchy Neon)",
  "colorCorrectionParams": {
    "brightness": 105,
    "contrast": 118,
    "saturation": 110,
    "temperature": "Slight cool tint (-5K)",
    "highlights": "-10% to preserve skin detail",
    "shadows": "+8% for filmic roll-off"
  },
  "recommendedBpm": 128,
  "trendingAudioVibe": "Phonk / Lofi Chill / Cinematic Bass Drop",
  "smartCaptions": [
    "Most people fail their habits because they rely on motivation...",
    "Here is the 2-minute rule that changed everything ⚡",
    "Save this for your morning routine tomorrow 📌"
  ],
  "optimalPostingTime": "07:45 AM or 06:15 PM local follower peak"
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text || '{}';
      return res.json(JSON.parse(text));
    } catch (err: any) {
      console.warn('Gemini reel assist error:', err?.message);
    }
  }

  return res.json({
    viralHookScript: `Stop building habits the hard way. Here is the 1 trick top performers use for ${niche || 'productivity'}:`,
    hookRetentionTip: 'Open with a 0.5s fast zoom-in and snap text animation across the center thirds.',
    recommendedColorLut: colorStyle || 'Cinematic Teal & Warm Gold',
    colorCorrectionParams: {
      brightness: 104,
      contrast: 115,
      saturation: 112,
      temperature: 'Warm Golden Hour (+120K)',
      highlights: '-8% highlight recovery',
      shadows: '+6% matte black lift'
    },
    recommendedBpm: 124,
    trendingAudioVibe: 'Cinematic Ambient Bass Surge',
    smartCaptions: [
      'The difference between 1% daily progress and burnout is system design 👇',
      'Track habits with friction-free triggers.',
      'Drop a 🔥 if you are locking in this week.'
    ],
    optimalPostingTime: '08:15 AM or 05:45 PM (Peak attention window)'
  });
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Parse port from CLI args (--port 3000) or env variable, defaulting to 3000
  let preferredPort = 3000;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    preferredPort = parseInt(process.argv[portArgIndex + 1], 10);
  } else if (process.env.PORT) {
    preferredPort = parseInt(process.env.PORT, 10);
  }
  const activePort = await findAvailablePort(preferredPort);

  const startListening = (portToTry: number) => {
    const serverInstance = app.listen(portToTry, '0.0.0.0', () => {
      console.log(`ApexLife Server running on http://0.0.0.0:${portToTry}`);
    });

    serverInstance.on('error', async (err: any) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = await findAvailablePort(portToTry + 1);
        console.warn(`[ApexLife] Port ${portToTry} encountered EADDRINUSE during startup. Incrementing to alternative port ${nextPort}...`);
        try {
          serverInstance.close();
        } catch {}
        startListening(nextPort);
      } else {
        console.error('Server listen error:', err);
      }
    });

    const cleanup = () => {
      try {
        serverInstance.close(() => {
          process.exit(0);
        });
      } catch {
        process.exit(0);
      }
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    return serverInstance;
  };

  startListening(activePort);
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
