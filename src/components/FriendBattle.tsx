import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Swords, Trophy, Camera, RotateCcw, Sparkles, User, UserPlus } from 'lucide-react';
import { MogResult } from '../types/analysis';
import { SAMPLE_RESULTS } from '../lib/samplePresets';
import { soundFx } from '../lib/soundEffects';

interface FriendBattleProps {
  player1Result: MogResult | null;
  player2Result: MogResult | null;
  player1Name: string;
  player2Name: string;
  onUpdatePlayerName: (player: 1 | 2, name: string) => void;
  onScanForPlayer: (playerIndex: 1 | 2) => void;
  onResetBattle: () => void;
  onLoadDemoOpponent: (playerIndex: 1 | 2, result: MogResult, name: string) => void;
  onBackToHome: () => void;
}

export const FriendBattle: React.FC<FriendBattleProps> = ({
  player1Result,
  player2Result,
  player1Name,
  player2Name,
  onUpdatePlayerName,
  onScanForPlayer,
  onResetBattle,
  onLoadDemoOpponent,
  onBackToHome,
}) => {
  const bothScanned = player1Result !== null && player2Result !== null;

  // Trigger celebration when both players have finished their scan
  useEffect(() => {
    if (bothScanned) {
      soundFx.playRevealFanfare();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#3D7BFF', '#FFC857'],
      });
    }
  }, [bothScanned]);

  const scoreDiff = bothScanned ? Math.abs(player1Result.mogScore - player2Result.mogScore) : 0;
  const winner = bothScanned
    ? player1Result.mogScore > player2Result.mogScore
      ? 1
      : player1Result.mogScore < player2Result.mogScore
      ? 2
      : 'tie'
    : null;

  const winnerName = winner === 1 ? player1Name : winner === 2 ? player2Name : 'Both Players';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest">
          <Swords className="w-3.5 h-3.5" />
          <span>Local Showdown Arena // Head-to-Head</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Who Mogs Who?
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          Scan Player 1 and Player 2 side-by-side to compare symmetry, canthal tilt, and aura points in a real head-to-head showdown.
        </p>
      </div>

      {/* Dynamic Showdown Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-purple-950/60 to-blue-950/60 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,229,255,0.15)] text-center space-y-2">
        {bothScanned ? (
          <>
            <div className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Trophy className="w-4 h-4" />
              <span>VERDICT: {winner === 'tie' ? 'TIED MATCH' : `${winnerName.toUpperCase()} MOGS!`}</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white">
              {winner === 'tie'
                ? '“Aura equilibrium achieved! An unbreakable stalemate of pure presence.”'
                : `“${winnerName} completely out-mogged the competition with a devastating +${scoreDiff} point differential!”`}
            </p>
          </>
        ) : player1Result && !player2Result ? (
          <>
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4" />
              <span>ROUND 1 COMPLETE // WAITING FOR {player2Name.toUpperCase()}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-200">
              {player1Name} scored a {player1Result.mogScore}/100 ({player1Result.rankTier}). Now scan {player2Name} to see who wins!
            </p>
          </>
        ) : !player1Result && player2Result ? (
          <>
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4" />
              <span>ROUND 1 COMPLETE // WAITING FOR {player1Name.toUpperCase()}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-200">
              {player2Name} scored a {player2Result.mogScore}/100 ({player2Result.rankTier}). Now scan {player1Name} to see who wins!
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Swords className="w-4 h-4" />
              <span>ARENA INITIALIZED // READY TO SCAN</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-200">
              Tap "Scan Face" below for Player 1 and Player 2 to compute live scores. No winner is decided until both faces are scanned!
            </p>
          </>
        )}
      </div>

      {/* Head-to-Head Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#07090D] border-2 border-cyan-400 items-center justify-center text-cyan-400 font-black text-sm z-10 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
          VS
        </div>

        {/* Player 1 Card */}
        <div
          className={`bg-[#10141C] rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            winner === 1
              ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.25)]'
              : player1Result
              ? 'border-zinc-700'
              : 'border-zinc-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <input
                type="text"
                value={player1Name}
                onChange={e => onUpdatePlayerName(1, e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-400 text-lg font-black text-white uppercase focus:outline-none"
                placeholder="Player 1"
              />
              {winner === 1 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                  WINNER
                </span>
              )}
            </div>

            {player1Result ? (
              <div className="py-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-zinc-400 uppercase">MOG SCORE</span>
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{player1Result.mogScore}</span>
                </div>

                <div className={`p-2.5 rounded-lg text-center text-xs font-extrabold uppercase ${player1Result.badgeColor.bg} ${player1Result.badgeColor.text} border ${player1Result.badgeColor.border}`}>
                  {player1Result.rankTier}
                </div>

                <div className="space-y-2 text-xs font-mono pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Aura Points:</span>
                    <span className="text-amber-400 font-bold">+{player1Result.auraPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Symmetry:</span>
                    <span className="text-cyan-400 font-bold">{player1Result.measurements.symmetryEstimate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Canthal Tilt:</span>
                    <span className="text-cyan-400 font-bold">{player1Result.measurements.canthalTilt.angleDeg > 0 ? '+' : ''}{player1Result.measurements.canthalTilt.angleDeg}°</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <User className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">Ready to Scan</span>
                  <span className="text-xs text-zinc-400 block font-mono">No face data recorded yet</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              soundFx.playTargetLock();
              onScanForPlayer(1);
            }}
            className="w-full mt-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>{player1Result ? `Rescan ${player1Name}` : `Scan Face for ${player1Name}`}</span>
          </button>
        </div>

        {/* Player 2 Card */}
        <div
          className={`bg-[#10141C] rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            winner === 2
              ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.25)]'
              : player2Result
              ? 'border-zinc-700'
              : 'border-zinc-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <input
                type="text"
                value={player2Name}
                onChange={e => onUpdatePlayerName(2, e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-400 text-lg font-black text-white uppercase focus:outline-none"
                placeholder="Challenger"
              />
              {winner === 2 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                  WINNER
                </span>
              )}
            </div>

            {player2Result ? (
              <div className="py-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-zinc-400 uppercase">MOG SCORE</span>
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{player2Result.mogScore}</span>
                </div>

                <div className={`p-2.5 rounded-lg text-center text-xs font-extrabold uppercase ${player2Result.badgeColor.bg} ${player2Result.badgeColor.text} border ${player2Result.badgeColor.border}`}>
                  {player2Result.rankTier}
                </div>

                <div className="space-y-2 text-xs font-mono pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Aura Points:</span>
                    <span className="text-amber-400 font-bold">+{player2Result.auraPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Symmetry:</span>
                    <span className="text-cyan-400 font-bold">{player2Result.measurements.symmetryEstimate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Canthal Tilt:</span>
                    <span className="text-cyan-400 font-bold">{player2Result.measurements.canthalTilt.angleDeg > 0 ? '+' : ''}{player2Result.measurements.canthalTilt.angleDeg}°</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">Ready to Scan</span>
                  <span className="text-xs text-zinc-400 block font-mono">Waiting for {player2Name}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              soundFx.playTargetLock();
              onScanForPlayer(2);
            }}
            className="w-full mt-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>{player2Result ? `Rescan ${player2Name}` : `Scan Face for ${player2Name}`}</span>
          </button>
        </div>

      </div>

      {/* Control Actions & Preset Bot Loader */}
      <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playBlip(700);
              onResetBattle();
            }}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Battle</span>
          </button>
          <span className="text-zinc-500 hidden sm:inline">|</span>
          <span className="text-zinc-400">Testing Solo?</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-zinc-500 text-[11px]">Load AI Opponent:</span>
          {Object.entries(SAMPLE_RESULTS).slice(0, 3).map(([key, res]) => (
            <button
              key={key}
              onClick={() => {
                soundFx.playBlip(800);
                onLoadDemoOpponent(2, res, res.rankTier);
              }}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-300 text-zinc-300 text-[11px] transition-colors"
            >
              {res.rankTier.replace('LEGENDARY MOGGER', 'Apex Bot').replace('FINAL BOSS', 'Boss Bot').replace('AURA FARMER', 'Farmer Bot')}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono text-zinc-400 hover:text-cyan-400 transition-colors"
        >
          &larr; Back to Lab Home
        </button>
      </div>

    </div>
  );
};