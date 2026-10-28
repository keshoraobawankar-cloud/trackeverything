import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Sliders,
  Calendar,
  Share2,
  Play,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  Instagram,
  Eye,
  Heart,
  Layers,
  Wand2,
  Trash2
} from 'lucide-react';
import { ReelTemplate, ReelPost } from '../types';
import { ApiService } from '../services/api';

interface ReelStudioViewProps {
  templates: ReelTemplate[];
  posts: ReelPost[];
  onAddPost: (post: Omit<ReelPost, 'id'>) => void;
  onUpdatePostStatus: (id: string, status: ReelPost['status']) => void;
  onDeletePost: (id: string) => void;
}

export const ReelStudioView: React.FC<ReelStudioViewProps> = ({
  templates,
  posts,
  onAddPost,
  onUpdatePostStatus,
  onDeletePost
}) => {
  // Current active template
  const [selectedTemplate, setSelectedTemplate] = useState<ReelTemplate>(templates[0]);
  const [reelTitle, setReelTitle] = useState('Why 99% Of People Fail Their Habits in 14 Days');
  const [overlayHookText, setOverlayHookText] = useState('STOP LOSING YOUR MORNINGS: The 3-Step Protocol');

  // Live Color Grading Filters
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(115);
  const [saturate, setSaturate] = useState(110);
  const [hueRotate, setHueRotate] = useState(0);
  const [selectedLutName, setSelectedLutName] = useState('Cinematic Teal & Orange');

  // AI Assistant states
  const [concept, setConcept] = useState('Morning 5am routine for high cognitive focus');
  const [niche, setNiche] = useState('Productivity & Self-Mastery');
  const [targetPlatform, setTargetPlatform] = useState<'Instagram Reels' | 'TikTok' | 'YouTube Shorts'>('Instagram Reels');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // New post modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newPostDate, setNewPostDate] = useState('2026-10-30 18:00');

  // Presets for AI color correction
  const colorPresets = [
    { name: 'Cinematic Teal & Orange', b: 104, c: 118, s: 112, h: -5, bg: 'linear-gradient(135deg, #0f172a, #1e293b, #78350f)' },
    { name: 'Cyberpunk Neon Vibe', b: 110, c: 125, s: 135, h: 45, bg: 'linear-gradient(135deg, #09090b, #4c1d95, #0891b2)' },
    { name: 'Warm Golden Hour', b: 106, c: 108, s: 118, h: 15, bg: 'linear-gradient(135deg, #18181b, #713f12, #9a3412)' },
    { name: 'Matte Minimal Film', b: 98, c: 105, s: 85, h: 0, bg: 'linear-gradient(135deg, #18181b, #27272a, #3f3f46)' },
    { name: 'Vibrant Punch LUT', b: 108, c: 120, s: 125, h: 0, bg: 'linear-gradient(135deg, #0f172a, #065f46, #0e7490)' }
  ];

  const handleApplyPreset = (p: typeof colorPresets[0]) => {
    setSelectedLutName(p.name);
    setBrightness(p.b);
    setContrast(p.c);
    setSaturate(p.s);
    setHueRotate(p.h);
  };

  const handleGenerateAiReel = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await ApiService.getReelAssist({
        concept,
        niche,
        targetPlatform,
        colorStyle: selectedLutName
      });
      setAiSuggestions(res);
      if (res.viralHookScript) {
        setOverlayHookText(res.viralHookScript);
      }
      if (res.colorCorrectionParams) {
        setBrightness(res.colorCorrectionParams.brightness || 105);
        setContrast(res.colorCorrectionParams.contrast || 115);
        setSaturate(res.colorCorrectionParams.saturation || 110);
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleScheduleReel = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPost({
      title: reelTitle,
      caption: aiSuggestions?.smartCaptions?.[0] || 'Swipe to see the exact protocol that unlocked 4 hours of morning deep work. ⚡ #habits #discipline #productivity',
      platform: targetPlatform,
      status: 'Scheduled',
      scheduledDate: newPostDate,
      views: 0,
      likes: 0,
      shares: 0,
      templateUsed: selectedTemplate.title,
      colorGrade: selectedLutName
    });
    setShowScheduleModal(false);
  };

  // Aggregated analytics
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = posts.reduce((acc, p) => acc + p.likes, 0);
  const publishedCount = posts.filter(p => p.status === 'Published').length;
  const scheduledCount = posts.filter(p => p.status === 'Scheduled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-violet-400" />
            Reel Studio, AI Color Correction & Social Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Intuitive drag-and-drop template designer, AI-powered filmic color correction, engagement trend analytics, and scheduled cross-platform posting.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Queue to Posting Calendar</span>
        </button>
      </div>

      {/* Reel Counter & Social Media Engagement Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Reel Reach</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{(totalViews / 1000).toFixed(1)}k</span>
            <span className="text-xs text-violet-400 font-medium">Impressions</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Across Instagram Reels & TikTok</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Engagement & Likes</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500/30" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{(totalLikes / 1000).toFixed(1)}k</span>
            <span className="text-xs text-rose-400 font-mono">11.4% Rate</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">High viral share retention</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Reel Creation Pipeline</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{publishedCount}</span>
            <span className="text-xs text-zinc-400 font-medium">Published / {scheduledCount} Scheduled</span>
          </div>
          <p className="mt-2 text-[11px] text-cyan-400 font-mono">
            {posts.length} total videos tracked
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Avg Retention Time</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">88.4%</span>
            <span className="text-xs text-emerald-400 font-mono">+6.2% vs avg</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Pattern interrupt hook effective</p>
        </div>
      </div>

      {/* Main Studio Editor: 9:16 Preview + Template Selector + Color Grading LUTs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 9:16 Live Preview Canvas (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-zinc-900/95 border border-zinc-800 p-6 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <span className="text-xs font-mono font-bold text-zinc-200">9:16 Vertical Video Preview</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {selectedTemplate.durationSeconds}s • {selectedTemplate.audioBpm} BPM
            </span>
          </div>

          {/* 9:16 Mobile Mock Frame with Applied CSS Filters */}
          <div
            className="relative w-64 h-[440px] rounded-2xl border-4 border-zinc-700 shadow-2xl overflow-hidden flex flex-col justify-between p-4 transition-all duration-300"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`,
              background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 100%)'
            }}
          >
            {/* Top Bar inside reel */}
            <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
              <span className="bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">ApexLife Studio</span>
              <span className="bg-rose-500/80 px-1.5 py-0.5 rounded text-[9px] font-bold">REC</span>
            </div>

            {/* Middle Overlay Hook Text */}
            <div className="my-auto text-center px-2">
              <div className="inline-block bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase drop-shadow-md">
                  {overlayHookText}
                </span>
              </div>
            </div>

            {/* Bottom Audio & Caption Simulation */}
            <div className="space-y-2">
              {/* Audio Waveform Simulation */}
              <div className="flex items-center justify-center gap-1 h-5">
                {[6, 12, 18, 14, 20, 8, 16, 19, 10, 14, 18, 9].map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-violet-400 rounded-full animate-pulse"
                    style={{ height: `${height}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>

              <div className="bg-black/50 backdrop-blur-sm p-2 rounded-lg text-[10px] text-white/90">
                <div className="font-semibold">{targetPlatform} Audio • 128 BPM</div>
                <div className="text-zinc-300 truncate">LUT: {selectedLutName}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-mono text-zinc-400">
              Grade applied: Brightness {brightness}% • Contrast {contrast}% • Saturation {saturate}%
            </span>
          </div>
        </div>

        {/* Right Column: Template Controls & Color Correction Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Drag & Drop / Select Templates */}
          <div className="rounded-2xl bg-zinc-900/95 border border-zinc-800 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Select Video Structure Template</h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">1-Click Apply</span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tmpl) => {
                const isSelected = selectedTemplate.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setOverlayHookText(tmpl.overlayText);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border-violet-500 shadow-sm shadow-violet-500/20'
                        : 'bg-zinc-850/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{tmpl.title}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-1">
                      {tmpl.durationSeconds}s • {tmpl.audioBpm} BPM
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-2 truncate">
                      Hook: "{tmpl.overlayText}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. AI-Powered Color Correction & Grading LUTs */}
          <div className="rounded-2xl bg-zinc-900/95 border border-zinc-800 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">AI Color Grading Profiles & Sliders</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">{selectedLutName}</span>
            </div>

            {/* Presets Grid */}
            <div className="mt-3 flex flex-wrap gap-2">
              {colorPresets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedLutName === p.name
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.bg }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Interactive Sliders */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="140"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Saturation</span>
                  <span>{saturate}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="150"
                  value={saturate}
                  onChange={(e) => setSaturate(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* 3. AI Viral Hook & Caption Generator */}
          <div className="rounded-2xl bg-zinc-900/95 border border-zinc-800 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">AI Viral Hook & Caption Optimization</h3>
              </div>
              <button
                onClick={handleGenerateAiReel}
                disabled={isGeneratingAi}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingAi ? 'Optimizing...' : 'Generate Viral Hooks'}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Video Topic / Concept</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Target Platform</label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                >
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                </select>
              </div>
            </div>

            {aiSuggestions && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs space-y-2">
                <div>
                  <span className="font-bold text-amber-300 block">3-Second Hook:</span>
                  <p className="text-zinc-200 mt-0.5">"{aiSuggestions.viralHookScript}"</p>
                </div>
                <div>
                  <span className="font-bold text-amber-300 block">Retention Trigger:</span>
                  <p className="text-zinc-300 mt-0.5">{aiSuggestions.hookRetentionTip}</p>
                </div>
                <div>
                  <span className="font-bold text-amber-300 block">Optimal Posting Schedule:</span>
                  <p className="text-emerald-400 font-mono mt-0.5">{aiSuggestions.optimalPostingTime}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Automated Posting Schedule Calendar Ledger */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Automated Posting Calendar & Workflow Management
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Queued cross-platform deployment queue</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{posts.length} tracked items</span>
        </div>

        <div className="divide-y divide-zinc-800/60 mt-2">
          {posts.map((post) => (
            <div key={post.id} className="py-3 px-3 rounded-lg hover:bg-zinc-850/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-100">{post.title}</span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    post.status === 'Published'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-3">
                  <span>{post.platform}</span>
                  <span>•</span>
                  <span>Scheduled: {post.scheduledDate}</span>
                  <span>•</span>
                  <span>LUT: {post.colorGrade}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                {post.status === 'Published' ? (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-zinc-500" /> {post.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> {post.likes.toLocaleString()}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onUpdatePostStatus(post.id, 'Published')}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
                  >
                    Mark Published
                  </button>
                )}

                <button
                  onClick={() => onDeletePost(post.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Queue Reel to Social Schedule</h3>
            <p className="text-xs text-zinc-400 mb-4">Set publishing time for automated distribution.</p>

            <form onSubmit={handleScheduleReel} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Reel Title</label>
                <input
                  type="text"
                  required
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Platform</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                  >
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={newPostDate}
                    onChange={(e) => setNewPostDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
                >
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
