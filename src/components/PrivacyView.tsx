import React, { useState } from 'react';
import { Shield, Check, Trash2, Lock, EyeOff, ServerOff, DatabaseZap } from 'lucide-react';
import { soundFx } from '../lib/soundEffects';

export const PrivacyView: React.FC = () => {
  const [cleared, setCleared] = useState(false);

  const handleClearLocalData = () => {
    try {
      localStorage.removeItem('iwillmogyou_muted');
      sessionStorage.clear();
      setCleared(true);
      soundFx.playBlip(900);
      setTimeout(() => setCleared(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Privacy Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Privacy Policy & Architecture
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          We treat camera and facial telemetry with zero-compromise security. Here is an honest, transparent breakdown of how our app handles your data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core pillar 1 */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ServerOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">100% On-Device Processing</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            All facial landmark calculations execute inside your browser using WebAssembly and WebGL shaders via Google MediaPipe. Your camera frames are never transmitted to any external cloud server.
          </p>
        </div>

        {/* Core pillar 2 */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Biometric Storage</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            We do not create persistent facial templates, run facial recognition, or compare faces against external databases. Once you close the session, the coordinates are discarded from RAM.
          </p>
        </div>

        {/* Core pillar 3 */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Full User Consent</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Your camera is activated strictly when you click to scan, and closes immediately when the scanner is stopped. Shared result cards default to omitting your photo unless explicitly enabled.
          </p>
        </div>

      </div>

      {/* Detailed Technical Disclosures */}
      <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
          <DatabaseZap className="w-5 h-5 text-cyan-400" />
          <span>Technical Architecture & Disclosures</span>
        </h3>

        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-mono">
          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 space-y-1">
            <span className="text-cyan-400 font-bold block">1. Computer Vision Library:</span>
            <span>
              Google MediaPipe Tasks-Vision FaceLandmarker (v0.10.x). The model files (.task) are static model weights downloaded directly to your browser cache.
            </span>
          </div>

          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 space-y-1">
            <span className="text-cyan-400 font-bold block">2. Image Export & Social Sharing:</span>
            <span>
              Result cards are synthesized client-side on an offscreen HTML5 canvas element. Downloading generates an instant data-URL download without intermediate server storage.
            </span>
          </div>

          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 space-y-1">
            <span className="text-cyan-400 font-bold block">3. Local Storage:</span>
            <span>
              Only minimal client-side preferences (such as audio mute toggle) are saved in browser `localStorage`.
            </span>
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white block">Purge Local Browser Data</span>
            <span className="text-[11px] text-zinc-400">Reset any stored UI preferences or cached temporary state.</span>
          </div>

          <button
            onClick={handleClearLocalData}
            className="px-4 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-mono flex items-center gap-2 transition-colors"
          >
            {cleared ? <Check className="w-4 h-4 text-emerald-400" /> : <Trash2 className="w-4 h-4" />}
            <span>{cleared ? 'Local Data Cleared!' : 'Purge Local Storage'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
