import React from 'react';
import { Lightbulb, Camera, Sun, Sparkles, Scissors, Sliders, ChevronRight } from 'lucide-react';
import { soundFx } from '../lib/soundEffects';

interface MoggerTipsViewProps {
  onStartScan: () => void;
}

export const MoggerTipsView: React.FC<MoggerTipsViewProps> = ({ onStartScan }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Presentation Codex</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Mogger Upgrade Mode
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          90% of sub-optimal facial scans are caused by optical distortion and harsh lighting. Learn how professional photographers optimize facial geometry presentation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tip 1: Focal Length & Lens Distortion */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">The Focal Length Illusion</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Standard smartphone front cameras use wide 24mm equivalent lenses. At close distances (under 12 inches), wide lenses cause barrel distortion—artificially exaggerating the center of the face (nose) while compressing the jaw and ears.
          </p>
          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 text-[11px] font-mono text-cyan-300">
            <strong>PRO FIX:</strong> Hold the camera 20–24 inches away (full arm extension) or step back and use 2x optical zoom to flatten perspective and reveal your true jaw proportions.
          </div>
        </div>

        {/* Tip 2: Lighting & Shadow Sculpting */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">45° Key Light Direction</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Overhead lighting (e.g. bathroom ceiling bulbs) casts severe down-shadows into eye sockets, creating artificial dark bags and breaking bilateral cheek symmetry.
          </p>
          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 text-[11px] font-mono text-amber-300">
            <strong>PRO FIX:</strong> Face a large north-facing window or diffused ring light positioned roughly 45° off-center to create subtle, flattering jawline contouring.
          </div>
        </div>

        {/* Tip 3: Head Pose & Level Horizon */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Camera Level & Canthal Plane</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Tilting your head backward artificially lowers your perceived canthal tilt and compresses the forehead. Tilting your head sideways destroys bilateral symmetry metrics.
          </p>
          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 text-[11px] font-mono text-purple-300">
            <strong>PRO FIX:</strong> Position the camera lens strictly level with your eye plane, keep your chin parallel to the floor, and look directly down the center of the lens.
          </div>
        </div>

        {/* Tip 4: Haircut & Facial Thirds Framing */}
        <div className="bg-[#10141C] border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Framing Facial Thirds</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            A well-structured haircut harmonizes your facial height-to-width ratio. If your jaw is narrower than your cheekbones, textured crops or clean tapered sides restore aesthetic balance.
          </p>
          <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 text-[11px] font-mono text-blue-300">
            <strong>PRO FIX:</strong> Low-to-mid taper fades sharpen lateral jawlines; keeping slight volume on top balances shorter vertical proportions.
          </div>
        </div>

      </div>

      <div className="p-6 rounded-2xl bg-[#10141C] border border-cyan-500/40 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Ready to Put These Upgrades into Practice?</h3>
        <p className="text-xs text-zinc-300 max-w-md mx-auto">
          Test your improved lighting and camera distance right now with a fresh scan.
        </p>
        <button
          onClick={() => {
            soundFx.playTargetLock();
            onStartScan();
          }}
          className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.35)]"
        >
          Retake Face Scan
        </button>
      </div>

    </div>
  );
};
