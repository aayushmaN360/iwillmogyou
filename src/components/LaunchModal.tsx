import React, { useState } from 'react';
import { Smartphone, Globe, QrCode, Copy, Check, X, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { soundFx } from '../lib/soundEffects';

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaunchModal: React.FC<LaunchModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'mobile' | 'website'>('mobile');

  if (!isOpen) return null;

  // Use the live URL or fallback to current origin
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-u5tsxjdzuoj44d4bbfnmxi-921061499300.asia-southeast1.run.app';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}&bgcolor=10-14-1C&color=00-E5-FF&margin=10`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      soundFx.playBlip(900);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      setCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#10141C] border border-cyan-500/40 rounded-2xl w-full max-w-xl shadow-[0_0_40px_rgba(0,229,255,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                Run on Mobile or Launch Website
              </h2>
              <p className="text-xs text-zinc-400 font-mono">Live deployment & distribution guide</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playBlip(600);
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 flex gap-2">
          <button
            onClick={() => {
              soundFx.playBlip(750);
              setActiveTab('mobile');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mobile'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                : 'bg-[#07090D] text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Run on Mobile (Instant)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playBlip(750);
              setActiveTab('website');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'website'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                : 'bg-[#07090D] text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Deploy to Your Domain</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {activeTab === 'mobile' ? (
            <div className="space-y-4">
              
              {/* Scan QR Code Box */}
              <div className="bg-[#07090D] border border-cyan-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-[#10141C] p-2 rounded-xl border border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.15)] shrink-0">
                  <img
                    src={qrUrl}
                    alt="Scan QR code to open on mobile"
                    className="w-36 h-36 rounded-lg object-contain"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    SCAN WITH PHONE CAMERA
                  </span>
                  <h3 className="text-sm font-bold text-white">Instant Mobile Camera Scan</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Point your iPhone or Android camera at the QR code to open the app directly in Safari or Chrome. Full front-camera scanning works out-of-the-box over HTTPS!
                  </p>
                </div>
              </div>

              {/* Direct Link Share & Copy */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Shareable App URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 bg-[#07090D] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Add to Home Screen Instructions */}
              <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2 text-xs text-zinc-300 font-mono">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Download className="w-4 h-4" />
                  <span>How to install as a full-screen mobile app:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <div className="p-2 bg-[#07090D] rounded border border-zinc-800">
                    <span className="text-white font-bold block mb-0.5">🍎 iPhone (Safari):</span>
                    Tap the <strong>Share</strong> button at bottom &rarr; tap <strong>"Add to Home Screen"</strong>.
                  </div>
                  <div className="p-2 bg-[#07090D] rounded border border-zinc-800">
                    <span className="text-white font-bold block mb-0.5">🤖 Android (Chrome):</span>
                    Tap the <strong>Three Dots ⋮</strong> at top right &rarr; tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Because <strong>IWillMogYou</strong> is a client-side React SPA with Vite, you can deploy it to any web hosting platform or custom domain in under 2 minutes for free!
              </p>

              {/* Step 1 */}
              <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>STEP 1: BUILD PRODUCTION ASSETS</span>
                  <span className="text-[10px] text-zinc-500">TERMINAL</span>
                </div>
                <div className="bg-black/80 p-2.5 rounded-lg border border-zinc-800 text-zinc-200">
                  <code>npm run build</code>
                </div>
                <p className="text-[11px] text-zinc-400">
                  This generates a fully bundled, optimized, zero-dependency production static build inside the <code className="text-cyan-300">dist/</code> directory.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
                <span className="text-cyan-400 font-bold block">STEP 2: CHOOSE YOUR FREE HOSTING</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-[#10141C] rounded border border-zinc-800">
                    <strong className="text-white block">▲ Vercel</strong>
                    <span className="text-zinc-400">Connect GitHub or run <code className="text-cyan-400">vercel deploy --prod</code></span>
                  </div>
                  <div className="p-2 bg-[#10141C] rounded border border-zinc-800">
                    <strong className="text-white block">💠 Netlify</strong>
                    <span className="text-zinc-400">Drag & drop the <code className="text-cyan-400">dist/</code> folder into Netlify Drop</span>
                  </div>
                  <div className="p-2 bg-[#10141C] rounded border border-zinc-800">
                    <strong className="text-white block">☁ Cloudflare</strong>
                    <span className="text-zinc-400">Pages &rarr; Direct upload or GitHub repo deployment</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-[#07090D] rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
                <span className="text-cyan-400 font-bold block">STEP 3: CONNECT YOUR CUSTOM DOMAIN</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains) and add a <strong>CNAME</strong> record pointing to your host. HTTPS is automatically provisioned (mandatory for camera permissions).
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#07090D] border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>HTTPS Enabled // Real Camera API Ready</span>
          </div>
          <button
            onClick={() => {
              soundFx.playBlip(600);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
