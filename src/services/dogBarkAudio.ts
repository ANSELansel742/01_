/**
 * Dog Bark & Sound Synthesizer using Web Audio API
 * Generates adorable puppy barks, yips, and panting sound effects purely in the browser.
 * Zero external audio files required!
 */

class DogBarkAudioService {
  private static instance: DogBarkAudioService;
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private constructor() {
    // Lazy audio context init on user gesture
  }

  public static getInstance(): DogBarkAudioService {
    if (!DogBarkAudioService.instance) {
      DogBarkAudioService.instance = new DogBarkAudioService();
    }
    return DogBarkAudioService.instance;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Play an authentic, playful, gentle puppy bark "Woof!"
   */
  public playBark(type: 'happy' | 'excited' | 'treat' | 'whimper' = 'happy'): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'treat') {
        // Double happy yip-yip!
        this.synthesizeSingleBark(ctx, now, 520, 0.16, 0.35);
        this.synthesizeSingleBark(ctx, now + 0.18, 580, 0.18, 0.4);
      } else if (type === 'excited') {
        // High-energy puppy bark
        this.synthesizeSingleBark(ctx, now, 480, 0.14, 0.3);
        this.synthesizeSingleBark(ctx, now + 0.14, 520, 0.15, 0.35);
        this.synthesizeSingleBark(ctx, now + 0.32, 600, 0.2, 0.4);
      } else {
        // Standard friendly "Woof!"
        this.synthesizeSingleBark(ctx, now, 440, 0.22, 0.35);
      }
    } catch (e) {
      console.warn('Audio bark playback note:', e);
    }
  }

  private synthesizeSingleBark(
    ctx: AudioContext,
    startTime: number,
    baseFreq: number,
    duration: number,
    volume: number
  ): void {
    // 1. Oscillator for vocal cord resonance (sawtooth with pitch sweep)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';

    // Bark pitch envelope: quick attack up, then fast decay down
    osc.frequency.setValueAtTime(baseFreq * 0.7, startTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, startTime + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, startTime + duration);

    // 2. Bandpass filter to model canine muzzle / formant cavity
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, startTime);
    filter.frequency.exponentialRampToValueAtTime(1200, startTime + 0.05);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);
    filter.Q.setValueAtTime(3.5, startTime);

    // 3. Amplitude envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // 4. Subtle pink noise for throat breathiness
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1400, startTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.4, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Connect vocal synth
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    noiseSource.start(startTime);
    noiseSource.stop(startTime + duration + 0.05);
  }
}

export const dogBarkAudio = DogBarkAudioService.getInstance();
