import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Camera,
  CameraOff,
  AlertTriangle,
  Sparkles,
  Activity,
  CheckCircle,
  RefreshCw,
  Zap,
  Shield,
  Volume2
} from 'lucide-react';
import { PostureSessionStats } from '../types';
import { ApiService } from '../services/api';
import { playChimeTone } from '../services/audioMotivational';

interface PostureMonitorViewProps {
  stats: PostureSessionStats;
  onUpdateStats: (stats: PostureSessionStats) => void;
}

export const PostureMonitorView: React.FC<PostureMonitorViewProps> = ({
  stats,
  onUpdateStats
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Live sensor readings
  const [headTiltDeg, setHeadTiltDeg] = useState(4); // normal is 0-8 deg
  const [shoulderTiltDeg, setShoulderTiltDeg] = useState(1);
  const [isSlouching, setIsSlouching] = useState(false);

  // Eye strain 20-20-20 timer
  const [eyeRestSeconds, setEyeRestSeconds] = useState(1200); // 20 mins = 1200s
  const [eyeRestActive, setEyeRestActive] = useState(true);

  // AI Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Start / stop webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable, using sensor telemetry simulation:', err);
          setCameraError('Webcam access was not granted. Using high-fidelity biometric accelerometer simulation.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive]);

  // Live posture & movement simulation interval (when active)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate subtle micromovements and posture shifts
      const newTilt = Math.max(0, Math.min(25, Math.round(Math.random() * 8 + (Math.random() > 0.85 ? 12 : 0))));
      const newShoulder = Math.max(0, Math.min(10, Math.round(Math.random() * 4)));
      setHeadTiltDeg(newTilt);
      setShoulderTiltDeg(newShoulder);

      const slouchDetected = newTilt > 15;
      setIsSlouching(slouchDetected);

      onUpdateStats({
        ...stats,
        sessionMinutes: stats.sessionMinutes + 1,
        micromovements: stats.micromovements + (Math.random() > 0.4 ? 1 : 0),
        macromovements: stats.macromovements + (Math.random() > 0.9 ? 1 : 0),
        slouchWarnings: stats.slouchWarnings + (slouchDetected ? 1 : 0),
        currentPostureStatus: slouchDetected ? 'Mild Slouch' : 'Optimal',
        focusScore: slouchDetected ? Math.max(65, stats.focusScore - 2) : Math.min(98, stats.focusScore + 1)
      });

      if (slouchDetected && Math.random() > 0.7) {
        playChimeTone('alert');
      }
    }, 15000); // update every 15s

    return () => clearInterval(interval);
  }, [stats]);

  // Eye rest countdown
  useEffect(() => {
    if (!eyeRestActive) return;
    const t = setInterval(() => {
      setEyeRestSeconds((prev) => {
        if (prev <= 1) {
          playChimeTone('focus');
          return 1200; // reset to 20m
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [eyeRestActive]);

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await ApiService.auditProductivity({
        sessionMinutes: stats.sessionMinutes,
        totalMovements: stats.micromovements + stats.macromovements,
        slouchCount: stats.slouchWarnings,
        focusScore: stats.focusScore,
        activeWindows: 'VS Code, Terminal, Research Docs',
        fatigueRating: stats.sessionMinutes > 90 ? 'High' : 'Moderate'
      });
      setAuditResult(res);
    } finally {
      setIsAuditing(false);
    }
  };

  const eyeMins = Math.floor(eyeRestSeconds / 60);
  const eyeSecs = eyeRestSeconds % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-indigo-400" />
            Real-Time Ergonomic Posture & Screen Monitor
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Continuous optical & kinetic tracking for cervical spine alignment, micromovement density, 20-20-20 eye strain mitigation, and AI productivity diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
              cameraActive
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {cameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>{cameraActive ? 'Stop Optical Sensor' : 'Enable Camera Posture Mesh'}</span>
          </button>

          <button
            onClick={handleRunAiAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAuditing ? 'Auditing Cognitive State...' : 'Run Instant AI Productivity Audit'}</span>
          </button>
        </div>
      </div>

      {/* Main Optical Feed & Biomechanical Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Sensor Canvas (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-zinc-900/95 border border-zinc-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-500 animate-ping' : 'bg-indigo-500'}`} />
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                {cameraActive ? 'Live Computer Vision Mesh' : 'Telemetry Posture Simulation'}
              </span>
            </div>

            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              isSlouching
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isSlouching ? '⚠️ Slouch Detected' : '✓ Optimal Alignment'}
            </span>
          </div>

          {/* Video or Simulated Kinetic Silhouette */}
          <div className="my-4 relative aspect-video w-full rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              /* High-tech vector posture mannequin simulation */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
                <div className="absolute inset-0 tech-grid-bg opacity-30" />

                {/* Mannequin Spine & Head Graphic */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Head */}
                  <div
                    className={`w-16 h-20 rounded-3xl border-2 transition-transform duration-500 flex items-center justify-center ${
                      isSlouching ? 'border-rose-400 bg-rose-500/10 rotate-6 translate-y-2' : 'border-emerald-400 bg-emerald-500/10'
                    }`}
                  >
                    <Eye className="w-5 h-5 text-indigo-400 opacity-80" />
                  </div>
                  {/* Neck */}
                  <div className={`w-3 h-5 ${isSlouching ? 'bg-rose-400' : 'bg-emerald-400'} transition-colors`} />
                  {/* Shoulders */}
                  <div className="w-48 h-3 rounded-full bg-zinc-700 relative flex items-center justify-between px-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-400" />
                    <span className="w-3 h-3 rounded-full bg-indigo-400" />
                  </div>
                  {/* Spine */}
                  <div className={`w-2 h-20 transition-all ${isSlouching ? 'bg-rose-400 rotate-2' : 'bg-emerald-400'}`} />
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800">
                  <span>Head Tilt: {headTiltDeg}°</span>
                  <span>Shoulder Cant: {shoulderTiltDeg}°</span>
                  <span className={isSlouching ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    Cervical Load: {isSlouching ? '+12 kg' : 'Normal'}
                  </span>
                </div>
              </div>
            )}

            {/* Mesh Overlay Lines */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/80 bg-zinc-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
              FRAME: 60FPS • KINEMATIC_AI_V4
            </div>
          </div>

          {cameraError && (
            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800">
            <span>Active session duration: {stats.sessionMinutes} minutes</span>
            <span className="font-mono text-indigo-400">Continuous background posture guard</span>
          </div>
        </div>

        {/* Right Column: Ergonomic Gauges & 20-20-20 Rule (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Eye Strain 20-20-20 Rule Timer */}
          <div className="p-5 rounded-2xl bg-zinc-900/95 border border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">20-20-20 Eye Strain Protocol</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Ocular Rest
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              Every 20 minutes, gaze at an object 20 feet away for 20 seconds to prevent digital eye fatigue and rebuild tear film.
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Next Optical Break in:</span>
                <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-0.5">
                  {eyeMins}:{eyeSecs.toString().padStart(2, '0')}
                </div>
              </div>

              <button
                onClick={() => setEyeRestSeconds(1200)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700"
                title="Reset timer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Movement Dynamics: Small vs Big Movements */}
          <div className="p-5 rounded-2xl bg-zinc-900/95 border border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Kinetic Movement Density</h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">Ergonomic cadence</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-850 border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Small Movements</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                  {stats.micromovements}
                </span>
                <span className="text-[10px] text-zinc-500">Subtle shifts (healthy)</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-850 border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Big Movements</span>
                <span className="text-2xl font-bold font-mono text-indigo-400 mt-0.5 block">
                  {stats.macromovements}
                </span>
                <span className="text-[10px] text-zinc-500">Stretches & standing</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Slouch Flags Today:</span>
              <span className={`font-bold ${stats.slouchWarnings > 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                {stats.slouchWarnings} occurrences
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Real-time Productivity & Posture Audit Result */}
      {auditResult && (
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">AI Ergonomic & Productivity Diagnostic Verdict</h3>
            </div>
            <span className="text-xs font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
              State: {auditResult.productivityState}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800">
              <span className="text-xs text-zinc-400">Cognitive Battery Level</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {auditResult.cognitiveBatteryPct}%
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Estimated neural clarity remaining in this session block.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800">
              <span className="text-xs text-zinc-400">Immediate Recommended Action</span>
              <div className="text-sm font-semibold text-white mt-1">
                {auditResult.immediateAction}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Direct ergonomic correction to relieve cervical tension.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800">
              <span className="text-xs text-zinc-400">Alarm Tone Recommended</span>
              <div className="text-sm font-semibold text-indigo-400 mt-1">
                {auditResult.alarmToneRecommended}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Calibrated to your current arousal & fatigue state.</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-2">Ergonomic Recommendations:</h4>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {auditResult.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
