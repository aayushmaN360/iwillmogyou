import React from 'react';
import { Award, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SAMPLE_RESULTS } from '../lib/samplePresets';
import { MogResult, RankTier } from '../types/analysis';
import { soundFx } from '../lib/soundEffects';

interface RanksViewProps {
  onStartScan: () => void;
  onInspectResult: (result: MogResult) => void;
}

interface TierInfo {
  tier: RankTier;
  range: string;
  title: string;
  description: string;
  points: string;
  badgeClass: string;
  criteria: string[];
}

const TIERS: TierInfo[] = [
  {
    tier: 'LEGENDARY MOGGER',
    range: '95 – 100',
    title: 'The Apex Aesthetic',
    description: 'Bilateral symmetry nearing optical perfection, razor-sharp hunter eye canthal axis, and ideal framing.',
    points: '+9,500 – 10,000+ AP',
    badgeClass: 'bg-amber-500/20 text-yellow-300 border-yellow-400/50 shadow-[0_0_20px_rgba(255,200,87,0.3)]',
    criteria: ['Symmetry index > 92%', 'Positive canthal tilt > +3.0°', 'Studio diffuse lighting', 'Level horizontal pose'],
  },
  {
    tier: 'FINAL BOSS',
    range: '80 – 94',
    title: 'Uncompromising Dominance',
    description: 'Heavy main-character energy. Outstanding lower-third jaw definition and intense camera engagement.',
    points: '+8,000 – 9,400 AP',
    badgeClass: 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_18px_rgba(0,229,255,0.25)]',
    criteria: ['Symmetry index 85–92%', 'Positive or neutral canthal axis', 'Clean portrait lighting', 'Strong jaw-to-cheek balance'],
  },
  {
    tier: 'AURA FARMER',
    range: '60 – 79',
    title: 'High Kinetic Presence',
    description: 'Consistently strong visual momentum. Passively harvesting charisma points in any room.',
    points: '+6,000 – 7,900 AP',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
    criteria: ['Symmetry index 75–84%', 'Balanced horizontal eye plane', 'Good portrait distance', 'Minimal head tilt'],
  },
  {
    tier: 'MAIN CHARACTER',
    range: '40 – 59',
    title: 'Center Stage Appeal',
    description: 'Reliable presence with solid foundational symmetry. Ready to enter the legendary training arc.',
    points: '+4,000 – 5,900 AP',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    criteria: ['Symmetry index 65–74%', 'Neutral eye angles', 'Acceptable ambient lighting', 'Standard mobile framing'],
  },
  {
    tier: 'SIDE CHARACTER',
    range: '20 – 39',
    title: 'Support Squad Royalty',
    description: 'Often held back by poor lighting, low camera angles, or strong shadows rather than actual geometry.',
    points: '+2,000 – 3,900 AP',
    badgeClass: 'bg-slate-700/30 text-slate-300 border-slate-500/40',
    criteria: ['Symmetry affected by tilt', 'Harsh overhead downlighting', 'Camera too close or too far', 'Head turned away'],
  },
  {
    tier: 'NPC ENERGY',
    range: '0 – 19',
    title: 'Spawn Point Novice',
    description: 'Camera angle requires immediate recalibration. Standing in the darkness waiting for a quest.',
    points: '+1,000 – 1,900 AP',
    badgeClass: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/40',
    criteria: ['Severe underexposure / blur', 'Heavy off-axis head tilt', 'Extreme wide-angle perspective distortion'],
  },
];

export const RanksView: React.FC<RanksViewProps> = ({ onStartScan, onInspectResult }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest">
          <Award className="w-3.5 h-3.5" />
          <span>Aura Hierarchy Codex</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          The Mog Ranks
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          Understand the six official tiers of the IWillMogYou ecosystem. Every score is deterministically computed from observable image landmarks and lighting conditions.
        </p>
      </div>

      <div className="space-y-4">
        {TIERS.map(t => {
          const sample = Object.values(SAMPLE_RESULTS).find(s => s.rankTier === t.tier);
          return (
            <div
              key={t.tier}
              className="bg-[#10141C] border border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${t.badgeClass}`}>
                    {t.tier}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    SCORE {t.range}
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  {t.points}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">{t.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{t.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                {t.criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>

              {sample && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      soundFx.playBlip(800);
                      onInspectResult(sample);
                    }}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View Sample Dossier</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Where Do You Stand on the Hierarchy?</h3>
        <p className="text-xs text-zinc-300 max-w-md mx-auto">
          Start your real-time camera scan to compute your official score and unlock your presentation insights.
        </p>
        <button
          onClick={() => {
            soundFx.playTargetLock();
            onStartScan();
          }}
          className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.35)]"
        >
          Start My Scan
        </button>
      </div>
    </div>
  );
};
