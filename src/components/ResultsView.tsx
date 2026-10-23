import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Swords,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Eye,
  Camera,
  Layers,
  Lightbulb,
} from 'lucide-react';
import { MogResult } from '../types/analysis';
import { downloadResultCard } from '../lib/resultCardExport';
import { soundFx } from '../lib/soundEffects';

interface ResultsViewProps {
  result: MogResult;
  onTryAgain: () => void;
  onChallengeFriend: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onTryAgain,
  onChallengeFriend,
}) => {
  const [showMeshOverlay, setShowMeshOverlay] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [copiedText, setCopiedText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [includePhotoInExport, setIncludePhotoInExport] = useState(true);

  // Trigger celebration confetti on mount
  useEffect(() => {
    soundFx.playRevealFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#3D7BFF', '#FFC857', '#9B5CFF'],
    });
  }, []);

  const handleCopySummary = async () => {
    const text = `🚨 I Just Got Scanned on IWillMogYou!
MOG SCORE: ${result.mogScore}/100
AURA RANK: ${result.rankTier} (+${result.auraPoints.toLocaleString()} AP)
VERDICT: "${result.verdict}"
Scan your face at: ${window.location.origin}`;

    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {
      // clipboard API failed or blocked in iframe/headless
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        success = true; // Still feedback in UI
      }
    }

    setCopiedText(true);
    soundFx.playBlip(950);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `IWillMogYou: ${result.rankTier}`,
          text: `My Mog Score is ${result.mogScore}/100 (${result.rankTier}). Challenge me!`,
          url: window.location.href,
        });
      } catch {
        // User canceled or failed
      }
    } else {
      handleCopySummary();
    }
  };

  const handleDownloadCard = async () => {
    setIsExporting(true);
    soundFx.playTargetLock();
    try {
      await downloadResultCard(result, includePhotoInExport && !!result.capturedImageUrl);
    } catch (err) {
      console.error('Failed to download result card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
            FACIAL TELEMETRY DOSSIER // COMPLETED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Official Mog Result
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playBlip(700);
              onTryAgain();
            }}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Again</span>
          </button>

          <button
            onClick={() => {
              soundFx.playTargetLock();
              onChallengeFriend();
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-extrabold uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
          >
            <Swords className="w-4 h-4" />
            <span>Challenge Friend</span>
          </button>
        </div>
      </div>

      {/* Main Score & Avatar Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#10141C] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(0,229,255,0.12)]">
        
        {/* Left Column: Scanned Snapshot with Toggleable Mesh Overlay */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative aspect-[3/4] w-full max-w-[280px] rounded-xl overflow-hidden border-2 border-cyan-500/40 bg-black shadow-lg">
            {result.capturedImageUrl ? (
              <img
                src={result.capturedImageUrl}
                alt="Scanned Face Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#07090D] flex flex-col items-center justify-center p-4 text-center">
                <Camera className="w-12 h-12 text-cyan-400 mb-2 opacity-60" />
                <span className="text-xs font-mono text-zinc-400">DEMO TELEMETRY PROFILE</span>
              </div>
            )}

            {/* Mesh Overlay Layer */}
            {showMeshOverlay && (
              <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
            )}

            {/* Corner brackets */}
            <div className="absolute inset-3 border border-cyan-400/30 rounded pointer-events-none">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Watermark badge */}
            <div className="absolute bottom-2 inset-x-2 bg-[#07090D]/85 border border-zinc-700/80 rounded px-2 py-1 text-[10px] font-mono text-zinc-400 flex justify-between items-center">
              <span className="text-cyan-400">IWILLMOGYOU</span>
              <span>{result.shareCode}</span>
            </div>
          </div>

          {/* Toggle mesh overlay switch */}
          {result.capturedImageUrl && (
            <button
              onClick={() => {
                soundFx.playBlip(750);
                setShowMeshOverlay(!showMeshOverlay);
              }}
              className="mt-3 text-xs font-mono text-zinc-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showMeshOverlay ? 'Hide Visual Mesh Grid' : 'Show Visual Mesh Grid'}</span>
            </button>
          )}
        </div>

        {/* Right Column: Score, Rank & Humorous Verdict */}
        <div className="md:col-span-7 space-y-5 text-center md:text-left">
          
          {/* Rank Badge */}
          <div className="inline-flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider border shadow-md ${result.badgeColor.bg} ${result.badgeColor.text} ${result.badgeColor.border}`}
            >
              <Sparkles className="w-4 h-4 inline-block mr-1.5" />
              {result.rankTier}
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded">
              +{result.auraPoints.toLocaleString()} AURA PTS
            </span>
          </div>

          {/* Giant Mog Score */}
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
              Calculated Mog Score
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
              <span className="text-6xl sm:text-7xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                {result.mogScore}
              </span>
              <span className="text-xl sm:text-2xl font-mono text-cyan-400 font-bold">/ 100</span>
            </div>
            <p className="text-xs font-mono text-zinc-500 mt-1">{result.rankSubtitle}</p>
          </div>

          {/* Verdict Box */}
          <div className="p-4 rounded-xl bg-[#07090D]/80 border border-zinc-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase font-bold">
              <span>SCANNER VERDICT</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-zinc-100 italic">
              "{result.verdict}"
            </p>
            <p className="text-xs text-zinc-400 italic">
              {result.quote}
            </p>
          </div>

          {/* Honest Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] font-mono text-zinc-500 text-left">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              Disclaimer: This is a playful entertainment score based on 2D image landmark geometry, symmetry, and lighting. It is not a scientific measure of human attractiveness or worth.
            </span>
          </div>

        </div>
      </div>

      {/* Actionable Presentation Tips (Mogger Upgrade Mode) */}
      <div className="bg-[#10141C] border border-cyan-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase">Mogger Upgrade Mode // Presentation Coaching</h3>
            <p className="text-xs text-zinc-400">Tailored suggestions based on your photo's lighting, angle, and facial proportions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {result.actionableTips.map((tip, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#07090D] border border-zinc-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-xs flex items-center justify-center shrink-0 border border-cyan-800/60">
                {idx + 1}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Facial Geometry & Measurements Breakdown */}
      <div className="bg-[#10141C] border border-zinc-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => {
            soundFx.playBlip(700);
            setShowBreakdown(!showBreakdown);
          }}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Facial Geometry & Presentation Telemetry
              </h3>
              <p className="text-xs text-zinc-400">Bilateral symmetry, canthal tilt, aspect ratios, and lighting analysis</p>
            </div>
          </div>
          {showBreakdown ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {showBreakdown && (
          <div className="p-5 pt-0 space-y-4 border-t border-zinc-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              
              {/* Metric 1: Bilateral Symmetry */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                  <span>BILATERAL SYMMETRY</span>
                  <span className="text-cyan-400 font-bold">{result.measurements.symmetryEstimate}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${result.measurements.symmetryEstimate}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-2">
                  Distance variance of eyes, cheeks, and jaw gonions to the facial midline.
                </p>
              </div>

              {/* Metric 2: Canthal Tilt */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                  <span>CANTHAL TILT AXIS</span>
                  <span className="text-cyan-400 font-bold">
                    {result.measurements.canthalTilt.angleDeg > 0 ? '+' : ''}
                    {result.measurements.canthalTilt.angleDeg}°
                  </span>
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/60 mt-1">
                  {result.measurements.canthalTilt.label}
                </span>
                <p className="text-[11px] font-mono text-zinc-500 mt-2">
                  {result.measurements.canthalTilt.description}
                </p>
              </div>

              {/* Metric 3: Facial Aspect Ratio */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                  <span>FACIAL ASPECT RATIO</span>
                  <span className="text-cyan-400 font-bold">{result.measurements.facialWidthToHeightRatio}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-mono text-zinc-400">Height / Bizygomatic Breadth</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-2">
                  Planar vertical height from chin to forehead divided by cheekbone width.
                </p>
              </div>

              {/* Metric 4: Jaw to Cheek Ratio */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                  <span>JAW-TO-CHEEK RATIO</span>
                  <span className="text-cyan-400 font-bold">{result.measurements.jawToCheekRatio}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                  Bigonial jaw width vs bizygomatic breadth
                </span>
                <p className="text-[11px] font-mono text-zinc-500 mt-2">
                  Structural lower-third definition indicator.
                </p>
              </div>

              {/* Metric 5: Image Lighting Quality */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                  <span>LIGHTING & CONTRAST</span>
                  <span className="text-cyan-400 font-bold">{result.measurements.imageQuality.lightingLabel}</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1 space-y-0.5">
                  <p>Luminance: {result.measurements.imageQuality.brightness} / 255</p>
                  <p>Sharpness Index: {result.measurements.imageQuality.sharpnessScore} / 100</p>
                </div>
              </div>

              {/* Metric 6: Head Pose / Leveling */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-zinc-800">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                  <span>HEAD POSE ANGLES</span>
                  <span className="text-cyan-400 font-bold">
                    {result.measurements.headPose.isLevel ? 'Level (Optimal)' : 'Tilted'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1 space-y-0.5">
                  <p>Roll: {result.measurements.headPose.roll}° • Pitch: {result.measurements.headPose.pitch}°</p>
                  <p>Yaw: {result.measurements.headPose.yaw}°</p>
                </div>
              </div>

            </div>

            {/* Documented limitations */}
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500 space-y-1">
              <span className="font-bold text-zinc-400 uppercase block">Engine Documentation & Known Limitations:</span>
              {result.measurements.limitations.map((lim, i) => (
                <p key={i}>• {lim}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Card Sharing & Download Section */}
      <div className="bg-[#10141C] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              <span>Export & Flex Your Mog Card</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Generate a high-res, shareable visual card for Instagram, TikTok, Twitter, or group chats.
            </p>
          </div>

          {result.capturedImageUrl && (
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePhotoInExport}
                onChange={e => setIncludePhotoInExport(e.target.checked)}
                className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500 bg-zinc-900"
              />
              <span>Include Photo on Export Card</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleDownloadCard}
            disabled={isExporting}
            className="py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Generating PNG...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Result Card</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopySummary}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs uppercase flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Result Text'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Socials</span>
          </button>
        </div>
      </div>

    </div>
  );
};
