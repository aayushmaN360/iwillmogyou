import React, { useState, useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { LandingHero } from './components/LandingHero';
import { CameraScanner } from './components/CameraScanner';
import { ResultsView } from './components/ResultsView';
import { RanksView } from './components/RanksView';
import { MoggerTipsView } from './components/MoggerTipsView';
import { FriendBattle } from './components/FriendBattle';
import { PrivacyView } from './components/PrivacyView';
import { LaunchModal } from './components/LaunchModal';
import { SAMPLE_RESULTS } from './lib/samplePresets';
import { MogResult } from './types/analysis';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'scanner' | 'ranks' | 'tips' | 'battle' | 'privacy' | 'results'>('home');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [scannerInitialMode, setScannerInitialMode] = useState<'camera' | 'upload'>('camera');
  const [currentResult, setCurrentResult] = useState<MogResult>(SAMPLE_RESULTS.finalBoss);
  
  // Battle mode player indexing
  const [targetBattlePlayer, setTargetBattlePlayer] = useState<1 | 2 | null>(null);
  const [battlePlayer1Result, setBattlePlayer1Result] = useState<MogResult>(SAMPLE_RESULTS.finalBoss);
  const [battlePlayer2Result, setBattlePlayer2Result] = useState<MogResult>(SAMPLE_RESULTS.auraFarmer);

  // Check URL query parameters for test automation & autostart
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        setIsScannerOpen(true);
      }
      if (params.get('view')) {
        const v = params.get('view') as typeof activeView;
        if (['home', 'ranks', 'tips', 'battle', 'privacy', 'results'].includes(v)) {
          setActiveView(v);
        }
      }
    }
  }, []);

  const handleStartScan = (mode: 'camera' | 'upload' = 'camera') => {
    setTargetBattlePlayer(null);
    setScannerInitialMode(mode);
    setIsScannerOpen(true);
  };

  const handleScanForBattlePlayer = (playerIndex: 1 | 2) => {
    setTargetBattlePlayer(playerIndex);
    setScannerInitialMode('camera');
    setIsScannerOpen(true);
  };

  const handleScanComplete = (result: MogResult) => {
    setIsScannerOpen(false);
    if (targetBattlePlayer === 1) {
      setBattlePlayer1Result(result);
      setTargetBattlePlayer(null);
      setActiveView('battle');
    } else if (targetBattlePlayer === 2) {
      setBattlePlayer2Result(result);
      setTargetBattlePlayer(null);
      setActiveView('battle');
    } else {
      setCurrentResult(result);
      setActiveView('results');
    }
  };

  const handleInspectSampleResult = (result: MogResult) => {
    setCurrentResult(result);
    setActiveView('results');
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F5F7FA] flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <AppHeader
        onStartScan={() => handleStartScan('camera')}
        onNavigate={view => {
          if (view === 'scanner') {
            handleStartScan('camera');
          } else {
            setActiveView(view);
          }
        }}
        onOpenLaunchModal={() => setIsLaunchModalOpen(true)}
        activeView={activeView}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <LandingHero
            onStartScan={() => handleStartScan('camera')}
            onUploadPhoto={() => handleStartScan('upload')}
            onInspectResult={handleInspectSampleResult}
            onNavigateToSection={view => setActiveView(view as typeof activeView)}
            onOpenLaunchModal={() => setIsLaunchModalOpen(true)}
          />
        )}

        {activeView === 'results' && (
          <ResultsView
            result={currentResult}
            onTryAgain={() => handleStartScan('camera')}
            onChallengeFriend={() => setActiveView('battle')}
          />
        )}

        {activeView === 'ranks' && (
          <RanksView
            onStartScan={() => handleStartScan('camera')}
            onInspectResult={handleInspectSampleResult}
          />
        )}

        {activeView === 'tips' && (
          <MoggerTipsView
            onStartScan={() => handleStartScan('camera')}
          />
        )}

        {activeView === 'battle' && (
          <FriendBattle
            initialPlayer1Result={currentResult}
            onScanForPlayer={handleScanForBattlePlayer}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'privacy' && <PrivacyView />}
      </main>

      {/* Live Camera / Photo Scanner Modal */}
      {isScannerOpen && (
        <CameraScanner
          initialMode={scannerInitialMode}
          onScanComplete={handleScanComplete}
          onCancel={() => setIsScannerOpen(false)}
        />
      )}

      {/* Launch / Mobile QR Modal */}
      <LaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
      />

      {/* Global Futuristic Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#07090D] py-8 text-zinc-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-300 font-bold">
              <span>IWILLMOGYOU</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                v2.4 TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              On-device computer vision facial scanning & meme ranking engine.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <button
              onClick={() => setActiveView('ranks')}
              className="hover:text-cyan-400 transition-colors"
            >
              Ranks Codex
            </button>
            <button
              onClick={() => setActiveView('tips')}
              className="hover:text-cyan-400 transition-colors"
            >
              Upgrade Tips
            </button>
            <button
              onClick={() => setActiveView('battle')}
              className="hover:text-cyan-400 transition-colors"
            >
              Battle Mode
            </button>
            <button
              onClick={() => setActiveView('privacy')}
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
