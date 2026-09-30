// Clean athletic & discreet audio cues using browser Web Audio API + HTML5 Audio Focus
class SoundService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private audioElement: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft click / check sound
  playCheck() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);

      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch {
      // Audio might be blocked until user gesture, ignore gracefully
    }
  }

  // Beep when starting rest timer
  playStart() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);

      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch {
      // ignore
    }
  }

  // Workout complete celebratory chime
  playTimerDone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.36);
      });
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Discreet alarm sound lasting exactly 3.0 seconds.
   * Plays 3 rhythmic, warm harmonic chime pulses across 3 seconds:
   * - Pulse 1 at 0.0s (E5 + B5)
   * - Pulse 2 at 1.0s (E5 + B5)
   * - Pulse 3 at 2.0s (G#5 + E6) decaying smoothly at 3.0s
   */
  playRestAlarm3s() {
    try {
      const ctx = this.getContext();
      if (ctx) {
        const startTime = ctx.currentTime;

        // Pulses configuration over 3.0 seconds
        const pulses = [
          { time: 0.0, freqs: [659.25, 987.77], gainVal: 0.13, decay: 0.75 }, // E5 + B5
          { time: 1.0, freqs: [659.25, 987.77], gainVal: 0.13, decay: 0.75 }, // E5 + B5
          { time: 2.0, freqs: [830.61, 1318.51], gainVal: 0.15, decay: 0.95 }, // G#5 + E6 (resolving)
        ];

        pulses.forEach(pulse => {
          pulse.freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime + pulse.time);

            // Envelope
            gain.gain.setValueAtTime(0, startTime + pulse.time);
            gain.gain.linearRampToValueAtTime(pulse.gainVal, startTime + pulse.time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0005, startTime + pulse.time + pulse.decay);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime + pulse.time);
            osc.stop(startTime + pulse.time + pulse.decay + 0.05);
          });
        });
      }

      // Also trigger HTMLAudioElement with synthesized buffer to request OS audio focus (ducking Spotify/music on supported browsers)
      this.playHtmlAudioDucking();

      // Rhythmic vibration over 3 seconds for phones in pockets
      if (navigator.vibrate) {
        // [vibrate, pause, vibrate, pause, vibrate, pause, vibrate]
        navigator.vibrate([250, 150, 250, 150, 400, 200, 600]);
      }
    } catch {
      // ignore
    }
  }

  // HTML5 audio ducking trigger
  private playHtmlAudioDucking() {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        // Generate a minimal silent/beep WAV data URI to assert audio focus
        this.audioElement.src = createWavDataUri();
      }
      this.audioElement.currentTime = 0;
      this.audioElement.play().catch(() => {});
    } catch {
      // ignore
    }
  }
}

// Generates a 3-second PCM WAV data URI for HTML5 audio ducking support
function createWavDataUri(): string {
  const sampleRate = 8000;
  const duration = 3.0; // 3 seconds
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // 3 gentle beeps across the 3 seconds
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    // Pulse 1: 0.0 - 0.7s, Pulse 2: 1.0 - 1.7s, Pulse 3: 2.0 - 2.9s
    const inPulse1 = t >= 0.0 && t < 0.7;
    const inPulse2 = t >= 1.0 && t < 1.7;
    const inPulse3 = t >= 2.0 && t < 2.9;

    if (inPulse1 || inPulse2 || inPulse3) {
      const pulseStart = inPulse1 ? 0.0 : inPulse2 ? 1.0 : 2.0;
      const relT = t - pulseStart;
      const decay = Math.exp(-relT * 4);
      const freq = inPulse3 ? 1046.5 : 880;
      sample = Math.sin(2 * Math.PI * freq * t) * 0.15 * decay;
    }

    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, intSample, true);
  }

  // Base64 encode
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const sounds = new SoundService();
