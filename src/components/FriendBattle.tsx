import React, { useState } from 'react';
import { Swords, Sparkles, Trophy, RotateCcw, Camera } from 'lucide-react';
import { MogResult } from '../types/analysis';
import { SAMPLE_RESULTS } from '../lib/samplePresets';
import { soundFx } from '../lib/soundEffects';

interface FriendBattleProps {
  initialPlayer1Result?: MogResult;
  onScanForPlayer: (playerIndex: 1 | 2) => void;
  onBackToHome: () => void;
}

export const FriendBattle: React.FC<FriendBattleProps> = ({
  initialPlayer1Result,
  onScanForPlayer,
  onBackToHome,
}) => {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Challenger');
  const [player1Result, setPlayer1Result] = useState<MogResult>(
    initialPlayer1Result || SAMPLE_RESULTS.finalBoss
  );
  const [player2Result, setPlayer2Result] = useState<MogResult>(
    SAMPLE_RESULTS.auraFarmer
  );

  const scoreDiff = Math.abs(player1Result.mogScore - player2Result.mogScore);
  const winner =
    player1Result.mogScore > player2Result.mogScore
      ? 1
      : player1Result.mogScore < player2Result.mogScore
      ? 2
      : 'tie';

  const winnerName = winner === 1 ? player1Name : winner === 2 ? player2Name : 'Both Players';

  const battleVerdict =
    winner === 'tie'
      ? 'Aura equilibrium achieved! An unbreakable stalemate of pure presence.'
      : `${winnerName} completely out-mogged the competition with a devastating +${scoreDiff} point differential!`;

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
          Scan or load two profiles side-by-side to compare symmetry, canthal tilt, and aura points in a local showdown.
        </p>
      </div>

      {/* Showdown Victor Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-purple-950/60 to-blue-950/60 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,229,255,0.15)] text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">
          <Trophy className="w-4 h-4" />
          <span>VERDICT: {winner === 'tie' ? 'TIED MATCH' : `${winnerName.toUpperCase()} MOGS!`}</span>
        </div>
        <p className="text-base sm:text-lg font-extrabold text-white">
          "{battleVerdict}"
        </p>
      </div>

      {/* Head-to-Head Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* VS Badge in center for desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#07090D] border-2 border-cyan-400 items-center justify-center text-cyan-400 font-black text-sm z-10 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
          VS
        </div>

        {/* Player 1 Card */}
        <div
          className={`bg-[#10141C] rounded-2xl p-6 border transition-all ${
            winner === 1 ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.2)]' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <input
              type="text"
              value={player1Name}
              onChange={e => setPlayer1Name(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-400 text-lg font-black text-white uppercase focus:outline-none"
              placeholder="Player 1"
            />
            {winner === 1 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-400 text-black font-extrabold">
                WINNER
              </span>
            )}
          </div>

          <div className="py-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase">MOG SCORE</span>
              <span className="text-4xl font-black text-white">{player1Result.mogScore}</span>
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

          <button
            onClick={() => {
              soundFx.playTargetLock();
              onScanForPlayer(1);
            }}
            className="w-full mt-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan Face for {player1Name}</span>
          </button>
        </div>

        {/* Player 2 Card */}
        <div
          className={`bg-[#10141C] rounded-2xl p-6 border transition-all ${
            winner === 2 ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.2)]' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <input
              type="text"
              value={player2Name}
              onChange={e => setPlayer2Name(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-400 text-lg font-black text-white uppercase focus:outline-none"
              placeholder="Challenger"
            />
            {winner === 2 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-400 text-black font-extrabold">
                WINNER
              </span>
            )}
          </div>

          <div className="py-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase">MOG SCORE</span>
              <span className="text-4xl font-black text-white">{player2Result.mogScore}</span>
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

          <button
            onClick={() => {
              soundFx.playTargetLock();
              onScanForPlayer(2);
            }}
            className="w-full mt-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan Face for {player2Name}</span>
          </button>
        </div>

      </div>

      {/* Preset Selector to Test Comparison */}
      <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-zinc-400">Quick Test Opponents:</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SAMPLE_RESULTS).map(([key, res]) => (
            <button
              key={key}
              onClick={() => {
                soundFx.playBlip(800);
                setPlayer2Result(res);
                setPlayer2Name(res.rankTier);
              }}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-300 text-zinc-300 transition-colors"
            >
              Load {res.rankTier}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
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
