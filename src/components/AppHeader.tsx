import React from 'react';
import { Sparkles, Camera, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../lib/soundEffects';

interface AppHeaderProps {
  onStartScan: () => void;
  onNavigate: (view: any) => void;
  onOpenLaunchModal: () => void;
  activeView: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onStartScan,
  onNavigate,
  onOpenLaunchModal,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/60 bg-[#07090D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-white">IWILL<span className="text-cyan-400">MOG</span>YOU</span>
        </button>

        <nav className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-400">
          <button onClick={() => onNavigate('ranks')} className="hover:text-cyan-400">Ranks</button>
          <button onClick={() => onNavigate('tips')} className="hover:text-cyan-400">Mogger Tips</button>
          <button onClick={() => onNavigate('battle')} className="hover:text-cyan-400">Friend Battle</button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400">Privacy</button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLaunchModal}
            className="px-2.5 py-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 text-xs font-mono"
          >
            📱 Phone / Deploy
          </button>
          <button
            onClick={onStartScan}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            <Camera className="w-4 h-4" />
            <span>Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};