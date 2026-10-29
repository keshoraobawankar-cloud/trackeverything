import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Flame,
  Activity,
  DollarSign,
  Clock,
  Eye,
  Video,
  Target,
  Download,
  Zap,
  PieChart,
  Bell,
  Calendar,
  Lock,
  Palette,
  Sparkles,
  Calculator,
  FileText,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
  Sliders,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { ThemeMode } from '../types';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Finance' | 'Fitness' | 'Habits' | 'Deep Work' | 'Posture' | 'Reel Studio' | 'System';
  tabTarget?: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  action?: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
  onLockApp: () => void;
  theme: ThemeMode;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenSettings,
  onLockApp,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const COMMAND_ITEMS: CommandItem[] = [
    // --- Navigation Views ---
    {
      id: 'nav-dashboard',
      title: 'Executive Dashboard & Telemetry',
      subtitle: 'System score, streak overview, daily progress matrix & biometrics',
      category: 'Navigation',
      tabTarget: 'dashboard',
      keywords: ['dashboard', 'home', 'overview', 'summary', 'telemetry', 'score', 'matrix'],
      icon: TrendingUp,
      color: 'text-indigo-400',
      badge: 'Main View'
    },
    {
      id: 'nav-habits',
      title: 'Habits & Streak Progression',
      subtitle: 'Daily streak tracker, habit checklists, and heatmaps',
      category: 'Habits',
      tabTarget: 'habits',
      keywords: ['habits', 'streaks', 'daily', 'consistency', 'routine', 'checklist'],
      icon: Flame,
      color: 'text-orange-400',
      badge: 'Habits'
    },
    {
      id: 'nav-fitness',
      title: 'Fitness & Biometric Intelligence Lab',
      subtitle: 'Workout logging, heart rate zones, BMI tracker, and AI training protocol',
      category: 'Fitness',
      tabTarget: 'fitness',
      keywords: ['fitness', 'workout', 'biometrics', 'gym', 'exercise', 'health', 'steps', 'calories'],
      icon: Activity,
      color: 'text-emerald-400',
      badge: 'Fitness'
    },
    {
      id: 'nav-finance',
      title: 'Financial Health & Recurring Subscriptions Hub',
      subtitle: 'Cashflow analysis, Recharts pie chart, budget cap, and upcoming spend prediction',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['finance', 'money', 'budget', 'subscriptions', 'cashflow', 'pie chart', 'expenses', 'income'],
      icon: DollarSign,
      color: 'text-cyan-400',
      badge: 'Finance'
    },
    {
      id: 'nav-study',
      title: 'Deep Work & Study AI Coach',
      subtitle: 'Hyper-focus Pomodoro timer, anime voice alarms, and AI roadmap generator',
      category: 'Deep Work',
      tabTarget: 'study',
      keywords: ['study', 'deep work', 'timer', 'pomodoro', 'anime', 'voice', 'focus', 'ai study plan'],
      icon: Clock,
      color: 'text-violet-400',
      badge: 'Deep Work'
    },
    {
      id: 'nav-posture',
      title: 'Posture & Screen Time AI Monitor',
      subtitle: 'Webcam posture tracker, ergonomics alerts, blink rate counter, fatigue audit',
      category: 'Posture',
      tabTarget: 'posture',
      keywords: ['posture', 'screen', 'webcam', 'slouch', 'ergonomics', 'blink', 'camera', 'neck'],
      icon: Eye,
      color: 'text-blue-400',
      badge: 'AI Vision'
    },
    {
      id: 'nav-reels',
      title: 'Reel Studio & Viral Content Suite',
      subtitle: 'Short-form video editor, viral hook AI generator, LUTs, and captions',
      category: 'Reel Studio',
      tabTarget: 'reels',
      keywords: ['reels', 'video', 'tiktok', 'instagram', 'shorts', 'creator', 'hook', 'captions'],
      icon: Video,
      color: 'text-pink-400',
      badge: 'Creator'
    },

    // --- Finance Deep Features ---
    {
      id: 'fn-quick-add',
      title: 'Quick Add Transaction (1-Tap Instant Log)',
      subtitle: 'Log coffee, lunch, gym, or groceries in 1 tap without long forms via FAB',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['quick add', 'fab', 'floating button', 'instant log', 'coffee', 'fast expense'],
      icon: Zap,
      color: 'text-cyan-400',
      badge: 'Quick Action'
    },
    {
      id: 'fn-budget-cap',
      title: 'Monthly Budget Cap & Utilization Gauge',
      subtitle: 'Set monthly spending limit, visualize progress alongside Recharts pie chart',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['budget cap', 'spending ceiling', 'budget progress', 'limit', 'pacing', 'allowance'],
      icon: Target,
      color: 'text-indigo-400',
      badge: 'Feature'
    },
    {
      id: 'fn-predicted-spend',
      title: 'Predicted Monthly Spend & Upcoming Bills Forecast',
      subtitle: 'Auto-calculates total predicted spend by adding upcoming recurring subscriptions',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['predicted spend', 'forecast', 'upcoming bills', 'recurring spend', 'month end'],
      icon: Calculator,
      color: 'text-indigo-400',
      badge: 'Auto-Forecast'
    },
    {
      id: 'fn-sub-alerts',
      title: 'Subscription Payment Alerts (Due in ≤ 3 Days)',
      subtitle: 'Notification badge and high-priority alert system for bills due within 3 days',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['subscription alerts', 'due soon', '3 days', 'renewal alert', 'billing notification'],
      icon: Bell,
      color: 'text-rose-400',
      badge: 'Alert System'
    },
    {
      id: 'fn-pie-chart',
      title: 'Expense Allocation Recharts Pie Chart',
      subtitle: 'Interactive donut breakdown showing percentage of spend across lifestyle pillars',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['pie chart', 'recharts', 'donut chart', 'breakdown', 'category spend', 'graph'],
      icon: PieChart,
      color: 'text-indigo-400',
      badge: 'Visualization'
    },
    {
      id: 'fn-export-csv',
      title: 'Export Financial Ledger as CSV Spreadsheet',
      subtitle: 'Download complete transaction history formatted for Excel or Google Sheets',
      category: 'Finance',
      tabTarget: 'finance',
      keywords: ['export csv', 'download finance', 'spreadsheet', 'excel', 'transactions csv'],
      icon: Download,
      color: 'text-cyan-400',
      badge: 'Export'
    },

    // --- Fitness Deep Features ---
    {
      id: 'fit-log-workout',
      title: 'Log Workout Session',
      subtitle: 'Record strength, cardio, HIIT, mobility with sets, calories, and heart rate',
      category: 'Fitness',
      tabTarget: 'fitness',
      keywords: ['log workout', 'record exercise', 'cardio', 'strength', 'calories burned'],
      icon: Dumbbell,
      color: 'text-emerald-400',
      badge: 'Action'
    },
    {
      id: 'fit-bmi',
      title: 'Biometric BMI & Body Composition Calculator',
      subtitle: 'Track body mass index progression, weight history, and healthy category ranges',
      category: 'Fitness',
      tabTarget: 'fitness',
      keywords: ['bmi calculator', 'weight', 'height', 'body mass', 'fat percentage'],
      icon: Activity,
      color: 'text-emerald-400',
      badge: 'Biometrics'
    },
    {
      id: 'fit-ai-protocol',
      title: 'Generate AI Workout & Protein Nutrition Protocol',
      subtitle: 'Personalized daily protein calculations and 4-day split kinesiology design',
      category: 'Fitness',
      tabTarget: 'fitness',
      keywords: ['protein calculator', 'ai workout', 'dietary tips', 'nutrition protocol', 'kinesiology'],
      icon: Sparkles,
      color: 'text-emerald-400',
      badge: 'AI Coach'
    },
    {
      id: 'fit-report',
      title: 'Generate Monthly Fitness Performance Report',
      subtitle: 'Comprehensive audit of total exercise volume, heart rate zones, and PDF export',
      category: 'Fitness',
      tabTarget: 'fitness',
      keywords: ['monthly report', 'fitness summary', 'performance audit', 'pdf report'],
      icon: FileText,
      color: 'text-emerald-400',
      badge: 'Report'
    },
    {
      id: 'fit-csv',
      title: 'Export Workout Logs as CSV Spreadsheet',
      subtitle: 'Export workout data, heart rate peaks, and calorie expenditure',
      category: 'Fitness',
      tabTarget: 'fitness',
      keywords: ['export workout csv', 'fitness csv', 'download workouts'],
      icon: Download,
      color: 'text-emerald-400',
      badge: 'Export'
    },

    // --- Study Deep Features ---
    {
      id: 'study-ai-plan',
      title: 'Generate AI Cognitive Study Plan Roadmap',
      subtitle: '4-week neuro-productivity study roadmap with morning priority focus blocks',
      category: 'Deep Work',
      tabTarget: 'study',
      keywords: ['study plan', 'ai study plan', 'cognitive coach', 'curriculum', 'roadmap'],
      icon: Sparkles,
      color: 'text-violet-400',
      badge: 'AI Tool'
    },
    {
      id: 'study-anime-alarm',
      title: 'Anime Motivational Voice Alarms',
      subtitle: 'High-energy audio motivational notifications when Pomodoro intervals complete',
      category: 'Deep Work',
      tabTarget: 'study',
      keywords: ['anime alarm', 'motivational voice', 'audio cues', 'bell', 'sound alert'],
      icon: Bell,
      color: 'text-amber-400',
      badge: 'Audio'
    },

    // --- Posture Deep Features ---
    {
      id: 'posture-ai-audit',
      title: 'Run AI Ergonomics & Productivity Audit',
      subtitle: 'Neuro-ergonomic assessment of spinal tilt, flow state score, and battery level',
      category: 'Posture',
      tabTarget: 'posture',
      keywords: ['posture audit', 'ergonomics audit', 'spinal alignment', 'flow state score'],
      icon: Sparkles,
      color: 'text-blue-400',
      badge: 'AI Vision'
    },

    // --- Reel Studio Deep Features ---
    {
      id: 'reel-hook-ai',
      title: 'Generate Viral Hook Script & Visual Cuts',
      subtitle: '3-second hook voiceovers, retention tips, and trending audio suggestions',
      category: 'Reel Studio',
      tabTarget: 'reels',
      keywords: ['viral hook', 'script generator', 'reel ai', 'retention tip', 'trending audio'],
      icon: Sparkles,
      color: 'text-pink-400',
      badge: 'AI Creator'
    },

    // --- System & Vault Settings ---
    {
      id: 'sys-theme',
      title: 'Switch Color Themes',
      subtitle: 'Obsidian, Cyber Neon, Matcha Calm, Sunset Orange, or Rose Quartz palettes',
      category: 'System',
      action: onOpenSettings,
      keywords: ['theme', 'color', 'dark mode', 'obsidian', 'cyber', 'palette', 'appearance'],
      icon: Palette,
      color: 'text-indigo-400',
      badge: 'Settings'
    },
    {
      id: 'sys-vault-lock',
      title: 'Lock Biometric Sandbox Vault',
      subtitle: 'Immediately lock the application behind local AES-256 biometric authentication',
      category: 'System',
      action: onLockApp,
      keywords: ['lock vault', 'security', 'biometrics', 'touchid', 'privacy', 'lock screen'],
      icon: Lock,
      color: 'text-zinc-400',
      badge: 'Security'
    },
    {
      id: 'sys-settings',
      title: 'Data Vault Backup & Export Settings',
      subtitle: 'Export complete JSON database backup or restore offline data encrypted',
      category: 'System',
      action: onOpenSettings,
      keywords: ['backup', 'restore', 'data export', 'json backup', 'settings'],
      icon: ShieldCheck,
      color: 'text-emerald-400',
      badge: 'Data'
    }
  ];

  // Filtering logic
  const filteredItems = COMMAND_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!query.trim()) return true;

    const lowerQuery = query.toLowerCase().trim();
    const titleMatch = item.title.toLowerCase().includes(lowerQuery);
    const subtitleMatch = item.subtitle.toLowerCase().includes(lowerQuery);
    const keywordMatch = item.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery));
    const categoryMatch = item.category.toLowerCase().includes(lowerQuery);

    return titleMatch || subtitleMatch || keywordMatch || categoryMatch;
  });

  const categories = ['All', 'Finance', 'Fitness', 'Habits', 'Deep Work', 'Posture', 'Reel Studio', 'System'];

  const handleSelect = (item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.tabTarget) {
      onNavigate(item.tabTarget);
    }
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700/90 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search any feature, tool, calculator, or view (e.g. 'budget', 'pie', 'bmi', 'alarm', 'csv')..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-850/50">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-zinc-800/90 border border-cyan-500/40 shadow-sm'
                      : 'hover:bg-zinc-850/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                      {item.category}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-zinc-600'}`} />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
              <p className="text-sm font-semibold text-zinc-300">No matching features found</p>
              <p className="mt-1 text-zinc-500">
                Try searching for 'budget', 'pie', 'workout', 'alarm', 'posture', or 'reels'
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">↵</kbd> to select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">ESC</kbd> to close</span>
          </div>
          <span className="text-zinc-500">
            {filteredItems.length} feature{filteredItems.length === 1 ? '' : 's'} available
          </span>
        </div>
      </div>
    </div>
  );
};
