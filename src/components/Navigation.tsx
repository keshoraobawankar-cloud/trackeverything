import {
  Flame,
  Activity,
  DollarSign,
  Clock,
  Eye,
  Video,
  ShieldCheck,
  LayoutDashboard,
  Palette,
  CloudCheck,
  Lock,
  Search
} from 'lucide-react';
import { ThemeMode } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streakCount: number;
  theme: ThemeMode;
  onOpenSettings: () => void;
  isLocked: boolean;
  onLockApp: () => void;
  onOpenCommandPalette: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  streakCount,
  onOpenSettings,
  isLocked,
  onLockApp,
  onOpenCommandPalette
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits & Streaks', icon: Flame },
    { id: 'fitness', label: 'Fitness & Biometrics', icon: Activity },
    { id: 'finance', label: 'Finances & Subs', icon: DollarSign },
    { id: 'study', label: 'Deep Work & Study AI', icon: Clock },
    { id: 'posture', label: 'Posture & Screen AI', icon: Eye },
    { id: 'reels', label: 'Reel Studio & Socials', icon: Video },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-base tracking-wider text-white">APX</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white">ApexLife</span>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400 border border-zinc-700/60">
                    Pro Suite
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">Habits • Biometrics • Deep Work • Creator</p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Cues & Action Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Command & Feature Finder */}
            <button
              onClick={onOpenCommandPalette}
              title="Search & Feature Finder (Cmd+K / Ctrl+K / /)"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-cyan-500/40 text-xs font-medium transition-all shadow-sm group"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              <span className="hidden md:inline text-zinc-300 font-sans">Find feature...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/80">⌘K</kbd>
            </button>

            {/* Global Streak Cue */}
            <button
              onClick={() => setActiveTab('habits')}
              title="Daily Active Streak"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-mono font-medium hover:bg-orange-500/20 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{streakCount}d Streak</span>
            </button>

            {/* Offline Encrypted Sync Status */}
            <div
              title="Local AES-256 Mocked Vault Mode - 100% Offline Capable"
              className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono"
            >
              <CloudCheck className="w-3.5 h-3.5" />
              <span>E2E Encrypted</span>
            </div>

            {/* Theme & Settings Trigger */}
            <button
              onClick={onOpenSettings}
              title="Theme Customizer & Vault Settings"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-700"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Security Lock App */}
            <button
              onClick={onLockApp}
              title="Lock Biometric Vault"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scroll Tab Bar */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-zinc-900 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
