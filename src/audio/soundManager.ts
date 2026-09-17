/**
 * Procedural Audio System using Web Audio API
 * Generates ambient music, day/night atmospheres, and sound effects for Cisini Stories.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.35;
  private sfxVolume: number = 0.5;
  private musicInterval: any = null;
  private cricketOsc: OscillatorNode | null = null;
  private cricketGain: GainNode | null = null;
  private currentPeriod: string = 'Pagi';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.cricketGain && this.ctx) {
      this.cricketGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  // Play a simple musical pluck (pentatonic / acoustic small-town vibe)
  public playPluck(freq: number, duration: number = 1.2, type: OscillatorType = 'triangle') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25 * this.musicVolume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio context error ignore
    }
  }

  // Sound Effects
  public playFootstep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  public playInteract() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  public playDialogueBlip(pitch: number = 440) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);

      gain.gain.setValueAtTime(0.05 * this.sfxVolume, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  public playClick() {
    this.playDialogueBlip(600);
  }

  public playFanfare() {
    this.playQuestComplete();
  }

  public playQuestAccept() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((f, i) => {
      setTimeout(() => this.playPluck(f, 0.6, 'sine'), i * 110);
    });
  }

  public playQuestComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C major fanfare
    notes.forEach((f, i) => {
      setTimeout(() => this.playPluck(f, 0.9, 'triangle'), i * 130);
    });
  }

  public playClueFound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Mysterious shimmer
    const notes = [493.88, 587.33, 739.99, 880];
    notes.forEach((f, i) => {
      setTimeout(() => this.playPluck(f, 1.4, 'sine'), i * 150);
    });
  }

  public playClockChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Town bell / gong sound
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now); // Middle C bell
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(523.25, now);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } catch (e) {}
  }

  // Play door open/close sound effect
  public playDoor() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // Start background procedural town melody
  public startBackgroundMusic(period: string = 'Pagi') {
    this.currentPeriod = period;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }

    // Gentle gamelan / acoustic guitar slendro-pelog inspired peaceful notes
    // Day notes (bright, nostalgic, warm): C4, D4, E4, G4, A4, C5
    // Night notes (quiet, contemplative, mysterious): A3, C4, D4, E4, G4, B4
    let step = 0;
    const dayMelody = [
      261.63, 329.63, 392.00, 440.00, 523.25, 392.00,
      329.63, 293.66, 329.63, 392.00, 440.00, 329.63
    ];
    const eveningMelody = [
      220.00, 261.63, 329.63, 392.00, 440.00, 329.63,
      246.94, 293.66, 369.99, 440.00, 329.63, 220.00
    ];
    const nightMelody = [
      220.00, 246.94, 293.66, 329.63, 392.00, 440.00,
      196.00, 246.94, 293.66, 369.99, 329.63, 220.00
    ];

    this.musicInterval = setInterval(() => {
      if (this.isMuted || this.musicVolume <= 0.01) return;

      const melody = this.currentPeriod === 'Malam' 
        ? nightMelody 
        : (this.currentPeriod === 'Sore' ? eveningMelody : dayMelody);
      
      const freq = melody[step % melody.length];
      // Play note with subtle variations
      const type = this.currentPeriod === 'Malam' ? 'sine' : 'triangle';
      this.playPluck(freq, 2.2, type);

      // Occasional sub-bass pedal note
      if (step % 4 === 0) {
        this.playPluck(freq / 2, 2.8, 'sine');
      }

      step++;
    }, 2400);

    // Night crickets
    this.updateAtmosphere(period);
  }

  public updateAtmosphere(period: string) {
    this.currentPeriod = period;
    this.initContext();
    if (!this.ctx) return;

    if (period === 'Malam' && !this.isMuted) {
      if (!this.cricketOsc) {
        try {
          this.cricketOsc = this.ctx.createOscillator();
          this.cricketGain = this.ctx.createGain();
          this.cricketOsc.type = 'sawtooth';
          this.cricketOsc.frequency.setValueAtTime(4600, this.ctx.currentTime);
          this.cricketGain.gain.setValueAtTime(0.015 * this.sfxVolume, this.ctx.currentTime);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(4500, this.ctx.currentTime);
          filter.Q.setValueAtTime(8, this.ctx.currentTime);

          this.cricketOsc.connect(filter);
          filter.connect(this.cricketGain);
          this.cricketGain.connect(this.ctx.destination);
          this.cricketOsc.start();
        } catch (e) {}
      }
    } else {
      if (this.cricketOsc) {
        try {
          this.cricketOsc.stop();
          this.cricketOsc.disconnect();
          this.cricketOsc = null;
        } catch (e) {}
      }
    }
  }

  public stopAll() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.cricketOsc) {
      try {
        this.cricketOsc.stop();
        this.cricketOsc.disconnect();
        this.cricketOsc = null;
      } catch (e) {}
    }
  }
}

export const soundManager = new SoundManager();
