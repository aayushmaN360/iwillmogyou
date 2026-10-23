/**
 * Web Audio API procedural synthesizer for sci-fi HUD sound effects
 * Zero external audio file dependencies, respects mute settings.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('iwillmogyou_muted') : null;
    this.isMuted = saved === 'true';
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('iwillmogyou_muted', String(this.isMuted));
    }
    if (!this.isMuted) {
      this.playBlip();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playBlip(freq: number = 880) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio not permitted or failed
    }
  }

  public playTargetLock() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [587.33, 880, 1174.66].forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + idx * 0.06);

        gain.gain.setValueAtTime(0.06, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.12);
      });
    } catch {
      // ignore
    }
  }

  public playScanningTone() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  public playRevealFanfare() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major
      const now = this.ctx.currentTime;
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundManager();
