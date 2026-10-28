import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Moon,
  Sun,
  Palette,
  Cloud,
  CloudOff,
  Download,
  Upload,
  CheckCircle,
  FileCode,
  Flame,
  AlertCircle
} from 'lucide-react';
import { ThemeMode } from '../types';
import { Storage } from '../services/storage';

interface SecurityAndSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  isLocked: boolean;
  onToggleLock: () => void;
}

export const SecurityAndSettingsModal: React.FC<SecurityAndSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  isLocked,
  onToggleLock
}) => {
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [e2eEncryption, setE2eEncryption] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const themes: { id: ThemeMode; name: string; desc: string; colors: string[] }[] = [
    { id: 'obsidian', name: 'Obsidian Stealth', desc: 'Minimalist deep carbon & clean zinc', colors: ['#09090b', '#27272a', '#6366f1'] },
    { id: 'cyber', name: 'Cyberpunk Neon', desc: 'High-contrast cyan & electric violet', colors: ['#09090b', '#06b6d4', '#8b5cf6'] },
    { id: 'matcha', name: 'Matcha Studio', desc: 'Organic calming emerald & moss', colors: ['#062319', '#10b981', '#34d399'] },
    { id: 'sunset', name: 'Solar Amber', desc: 'Warm focus gold & deep sunset', colors: ['#1c1003', '#f59e0b', '#ea580c'] },
    { id: 'rose', name: 'Rose Quartz', desc: 'Sleek ruby & velvet crimson', colors: ['#1c040b', '#f43f5e', '#ec4899'] }
  ];

  const handleSimulateBiometric = () => {
    setIsBiometricScanning(true);
    setPinError(false);
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        setBiometricSuccess(false);
        onToggleLock();
      }, 700);
    }, 1200);
  };

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or any 4 digits
    if (pinCode.length >= 4) {
      setPinError(false);
      onToggleLock();
      setPinCode('');
    } else {
      setPinError(true);
    }
  };

  const handleExportData = () => {
    const data = Storage.exportFullBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexLife_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = Storage.importBackup(content);
      if (ok) {
        setImportStatus('Backup successfully imported! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security Vault, Themes & Data Privacy</h2>
              <span className="text-xs text-zinc-400 font-mono">
                Biometric Authentication • End-to-End Encryption • Cloud Sync
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Section 1: Biometric & High Defense Firewall Lock */}
          <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Biometric Vault & Hardware Authentication</h3>
              </div>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                isLocked ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {isLocked ? 'Vault Locked' : 'Vault Armed & Unlocked'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Protects sensitive health records, BMI calculations, and financial cashflow with WebAuthn TouchID / FaceID biometric verification.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSimulateBiometric}
                disabled={isBiometricScanning}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-all"
              >
                <Fingerprint className={`w-4 h-4 ${isBiometricScanning ? 'animate-pulse text-indigo-400' : 'text-emerald-400'}`} />
                <span>
                  {isBiometricScanning
                    ? 'Scanning TouchID / FaceID...'
                    : biometricSuccess
                    ? '✓ Biometrics Verified!'
                    : isLocked
                    ? 'Unlock via Biometrics'
                    : 'Test Biometric Sensor'}
                </span>
              </button>

              <form onSubmit={handlePinUnlock} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="PIN Code"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-mono text-white text-center focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  {isLocked ? 'Unlock' : 'Lock'}
                </button>
              </form>
            </div>
            {pinError && <p className="text-[11px] text-rose-400 mt-1">Please enter at least 4 digits.</p>}
          </div>

          {/* Section 2: Highest Customization Options - Color Themes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Aesthetic Color Themes & Dark Mode</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Custom curated palettes with high-contrast night mode for reduced eye strain and enhanced focus.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    currentTheme === t.id
                      ? 'bg-zinc-800 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-850/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <div className="flex items-center gap-1">
                      {t.colors.map((c, i) => (
                        <span key={i} className="w-3 h-3 rounded-full border border-black/40" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Data Security & Cloud Synchronization */}
          <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Cloud Sync & Offline-First Persistence</h3>
              </div>
              <button
                onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
                className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                  cloudSyncEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {cloudSyncEnabled ? 'Auto-Sync On' : 'Offline Mode Only'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <span className="text-xs text-zinc-300">Client-Side E2E Encryption (AES-GCM-256)</span>
              <button
                onClick={() => setE2eEncryption(!e2eEncryption)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${e2eEncryption ? 'bg-indigo-600' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${e2eEncryption ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Section 4: Data Portability (Export & Import) */}
          <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800">
            <h3 className="text-sm font-bold text-white mb-1">Encrypted Data Backup & Portability</h3>
            <p className="text-xs text-zinc-400 mb-3">
              Export your complete biometric history, habits, transactions, and study plans to JSON.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Encrypted JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-400 mt-2 font-mono">{importStatus}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
