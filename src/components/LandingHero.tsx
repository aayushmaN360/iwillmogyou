import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Shield, ChevronRight, Award, Zap, HelpCircle } from 'lucide-react';
import { SAMPLE_RESULTS } from '../lib/samplePresets';
import { MogResult } from '../types/analysis';
import { soundFx } from '../lib/soundEffects';

interface LandingHeroProps {
  onStartScan: () => void;
  onUploadPhoto: () => void;
  onInspectResult: (result: MogResult) => void;
  onNavigateToSection: (sectionId: string) => void;
  onOpenLaunchModal: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartScan,
  onUploadPhoto,
  onInspectResult,
  onNavigateToSection,
  onOpenLaunchModal,
}) => {
  const [activeDemoPreset, setActiveDemoPreset] = useState<'finalBoss' | 'auraFarmer' | 'mainCharacter'>('finalBoss');
  const demoResult = SAMPLE_RESULTS[activeDemoPreset];

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-cyan-600/15 via-blue-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Real-Time Neural Face Mesh // 0-100 Aura Scale</span>
            </div>

            {/* Giant Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
              I WILL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">MOG YOU.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-zinc-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Meet your face scanner. Discover your aura rank, explore your photo presentation, and challenge your friends.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playTargetLock();
                  onStartScan();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <Camera className="w-5 h-5 text-black" />
                <span>Start My Scan</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playBlip(700);
                  onUploadPhoto();
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#10141C] hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4 text-zinc-400" />
                <span>Upload a Photo</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playBlip(800);
                  onOpenLaunchModal();
                }}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/60 font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
                title="Scan QR code to open on mobile"
              >
                <span>📱</span>
                <span>Open on Mobile</span>
              </button>
            </div>

            {/* Trust & Privacy Pill */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-zinc-400 pt-2 font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>100% On-Device Processing • No Face Images Saved • Zero External Uploads</span>
            </div>
          </div>

          {/* Right Hero Column: Interactive Lab Scanner Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-[#10141C]/90 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,229,255,0.12)] relative overflow-hidden backdrop-blur-sm">
              
              {/* Header HUD Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-300 font-bold">SYSTEM // DEMO PREVIEW</span>
                </div>
                <span>FPS: 60.0 // 468 PTS</span>
              </div>

              {/* Viewport Frame with Cybernetic Face Mesh Demo */}
              <div className="relative mt-3 aspect-[3/4] rounded-xl bg-gradient-to-b from-[#0A0D14] to-[#040608] border border-cyan-900/40 overflow-hidden flex items-center justify-center">
                
                {/* Tech Grid Background */}
                <div className="absolute inset-0 bg-tech-grid opacity-60" />

                {/* Animated Horizontal Scanline */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline shadow-[0_0_15px_#00E5FF] z-10" />

                {/* Futuristic Framing Brackets */}
                <div className="absolute inset-4 border border-cyan-500/20 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                </div>

                {/* Cyber Face Silhouette Wireframe Graphic */}
                <svg
                  viewBox="0 0 300 400"
                  className="w-full h-full max-h-[340px] drop-shadow-[0_0_12px_rgba(0,229,255,0.5)] z-0"
                >
                  {/* Outer Face Contour */}
                  <polygon
                    points="150,50 185,60 215,90 235,130 240,180 230,240 205,290 175,330 150,350 125,330 95,290 70,240 60,180 65,130 85,90 115,60"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                  {/* Bilateral Midline */}
                  <line
                    x1="150"
                    y1="50"
                    x2="150"
                    y2="350"
                    stroke="#00E5FF"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    strokeOpacity="0.4"
                  />
                  {/* Cheeks & Jaw Structure Lines */}
                  <line x1="85" y1="200" x2="215" y2="200" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1="95" y1="290" x2="205" y2="290" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.3" />
                  
                  {/* Left Eye & Canthal axis */}
                  <polygon points="105,170 120,165 135,170 120,175" fill="none" stroke="#00E5FF" strokeWidth="1.2" />
                  <circle cx="120" cy="170" r="2.5" fill="#00E5FF" />
                  <line x1="95" y1="172" x2="140" y2="167" stroke="#3D7BFF" strokeWidth="1" strokeOpacity="0.8" />

                  {/* Right Eye & Canthal axis */}
                  <polygon points="165,170 180,165 195,170 180,175" fill="none" stroke="#00E5FF" strokeWidth="1.2" />
                  <circle cx="180" cy="170" r="2.5" fill="#00E5FF" />
                  <line x1="160" y1="167" x2="205" y2="172" stroke="#3D7BFF" strokeWidth="1" strokeOpacity="0.8" />

                  {/* Nose Bridge and Tip */}
                  <line x1="150" y1="150" x2="150" y2="225" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.7" />
                  <circle cx="150" cy="225" r="4" fill="#00E5FF" />
                  <circle cx="150" cy="225" r="9" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.6" />

                  {/* Mouth / Lip contours */}
                  <polygon points="125,265 150,260 175,265 150,275" fill="none" stroke="#00E5FF" strokeWidth="1.2" strokeOpacity="0.6" />

                  {/* Key nodes */}
                  {[
                    [150, 50], [150, 350], [85, 200], [215, 200],
                    [95, 290], [205, 290], [105, 170], [195, 170]
                  ].map(([cx, cy], idx) => (
                    <circle key={idx} cx={cx} cy={cy} r="3" fill="#00E5FF" />
                  ))}
                </svg>

                {/* Floating Metric Badges */}
                <div className="absolute top-6 left-6 bg-[#07090D]/85 border border-cyan-500/40 rounded px-2 py-1 text-[10px] font-mono text-cyan-300">
                  SYMMETRY: {demoResult.measurements.symmetryEstimate}%
                </div>
                <div className="absolute top-6 right-6 bg-[#07090D]/85 border border-cyan-500/40 rounded px-2 py-1 text-[10px] font-mono text-cyan-300">
                  CANTHAL: +{demoResult.measurements.canthalTilt.angleDeg}°
                </div>
                <div className="absolute bottom-6 inset-x-6 bg-[#07090D]/90 border border-zinc-700 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Rank Status</span>
                    <span className="text-sm font-extrabold text-cyan-300">{demoResult.rankTier}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Mog Score</span>
                    <span className="text-lg font-black text-white">{demoResult.mogScore}<span className="text-xs text-cyan-400">/100</span></span>
                  </div>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-400">Sample Tier:</span>
                <div className="flex gap-1.5">
                  {(['finalBoss', 'auraFarmer', 'mainCharacter'] as const).map(tierKey => (
                    <button
                      key={tierKey}
                      onClick={() => {
                        soundFx.playBlip(800);
                        setActiveDemoPreset(tierKey);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                        activeDemoPreset === tierKey
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tierKey.replace('finalBoss', 'Final Boss').replace('auraFarmer', 'Farmer').replace('mainCharacter', 'Main')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] font-mono text-zinc-500 mt-2 text-center">
                * Demonstration overlay graphic. Real camera scan tracks your actual live landmarks.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Four Core Features Grid */}
      <section className="border-t border-cyan-950/40 bg-[#0B0F17]/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase text-cyan-400 tracking-widest">Advanced Visual Lab</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Engineered for Accuracy & Entertainment</p>
            <p className="text-sm text-zinc-400 mt-2">
              Combining on-device computer vision with viral meme culture and practical presentation advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#10141C] border border-zinc-800 hover:border-cyan-500/50 rounded-xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Live Face Mesh</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                468 high-precision facial landmarks mapped directly in your browser. Real tracking, not a decorative fake filter.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#10141C] border border-zinc-800 hover:border-blue-500/50 rounded-xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Mog Score & Aura Rank</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deterministic 0–100 meme score calculated from facial symmetry, pose, lighting, and canthal tilt geometry.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#10141C] border border-zinc-800 hover:border-purple-500/50 rounded-xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Presentation Insights</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Concrete advice on camera distance, lighting angles, head level, and flattering haircut styling ideas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#10141C] border border-zinc-800 hover:border-amber-500/50 rounded-xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Battle & Export</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Challenge friends to a head-to-head showdown and download high-res viral result cards for Instagram or TikTok.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Sample Results Hierarchy Showcase */}
      <section className="py-16 bg-[#07090D] border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest">Aura Tiers Archive</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Sample Mog Results</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Explore the official tier breakdowns. Click any card to inspect full telemetry.
              </p>
            </div>

            <button
              onClick={() => {
                soundFx.playTargetLock();
                onStartScan();
              }}
              className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 px-3 py-2 rounded-lg transition-colors"
            >
              <span>Test Your Own Face</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(SAMPLE_RESULTS).map(([key, result]) => (
              <div
                key={key}
                onClick={() => {
                  soundFx.playBlip(850);
                  onInspectResult(result);
                }}
                className="cursor-pointer bg-[#10141C] border border-zinc-800 hover:border-cyan-500/60 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                    <span>MOG SCORE</span>
                    <span className="text-lg font-black text-white">{result.mogScore}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-center text-xs font-extrabold uppercase mb-2 ${result.badgeColor.bg} ${result.badgeColor.text} border ${result.badgeColor.border}`}>
                    {result.rankTier}
                  </div>
                  <p className="text-xs text-zinc-300 italic line-clamp-2">
                    "{result.verdict}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span>+{result.auraPoints.toLocaleString()} AP</span>
                  <span>View Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Banner */}
      <section className="py-10 bg-[#0B0F17]/80 border-t border-cyan-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 mx-auto">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Privacy Is Absolute</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Your camera is used only after you grant permission. Basic scanning runs on your device whenever possible. You control whether an image is uploaded or shared. No biometric identification or facial databases are ever accessed.
          </p>
        </div>
      </section>
    </div>
  );
};
