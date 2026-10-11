/**
 * CS:GO Food Case Audio Synthesizer Engine
 * Uses Web Audio API for zero-latency, realistic mechanical clicks,
 * case unlock sounds, and epic rarity fanfares with no external audio file dependencies!
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.lastTickTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
    }

    // Realistic CS:GO Reel Mechanical Click
    playTick(pitchMod = 1.0) {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;
        // Throttle to avoid audio clipping if items scroll insanely fast
        if (now - this.lastTickTime < 0.015) return;
        this.lastTickTime = now;

        // Oscillator with fast decay & noise pop for mechanical tactile feel
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        // Base frequency between 1200Hz - 1500Hz with slight variation
        const baseFreq = (1300 + Math.random() * 200) * pitchMod;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(3.5, now);

        // Slightly punchier volume on tension ticks as it slows down
        const tickVol = 0.32 + Math.min(0.12, (pitchMod - 0.95) * 0.3);
        gain.gain.setValueAtTime(tickVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Heavy metallic latch unlocking sound
    playCaseOpen() {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;

        // 1. Heavy thud / metallic latch
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(160, now);
        osc1.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gain1.gain.setValueAtTime(0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // 2. High metallic click
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(2400, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain2.gain.setValueAtTime(0.4, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.2);

        // 3. Sci-fi whoosh
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.linearRampToValueAtTime(3200, now + 0.3);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.4);
    }

    // Win chime tailored to CS:GO rarity tiers
    playWin(rarityKey) {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;

        if (rarityKey === 'gold') {
            // ★ CS:GO GOLD SPECIAL ITEM FANFARE! (Bass explosion + Heavenly Arpeggios)
            this.playSubBass(now, 0.7);
            
            // Major Triad Arpeggio rising fast
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                this.playTone(freq, now + idx * 0.09, 0.6, 'sine', 0.4);
                this.playTone(freq * 1.5, now + idx * 0.09, 0.4, 'triangle', 0.2);
            });

            // Sparkling bells
            for (let i = 0; i < 12; i++) {
                const bellFreq = 1200 + Math.random() * 1600;
                this.playTone(bellFreq, now + 0.6 + i * 0.08, 0.3, 'sine', 0.15);
            }

        } else if (rarityKey === 'red') {
            // COVERT (Red) - Cinematic Boom + Suspense chord
            this.playSubBass(now, 0.5);
            const chords = [392.00, 493.88, 587.33, 783.99]; // G Major chord
            chords.forEach((freq, idx) => {
                this.playTone(freq, now + idx * 0.1, 0.8, 'sawtooth', 0.25);
                this.playTone(freq * 2, now + 0.2 + idx * 0.08, 0.6, 'sine', 0.2);
            });

        } else if (rarityKey === 'pink') {
            // CLASSIFIED (Pink) - Bright Triple Chime
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, idx) => {
                this.playTone(freq, now + idx * 0.12, 0.5, 'sine', 0.3);
            });

        } else if (rarityKey === 'purple') {
            // RESTRICTED (Purple) - Upbeat double chime
            this.playTone(392.00, now, 0.35, 'triangle', 0.3);
            this.playTone(523.25, now + 0.15, 0.5, 'sine', 0.35);

        } else {
            // MIL-SPEC (Blue) - Clean simple completion chime
            this.playTone(440, now, 0.25, 'sine', 0.25);
            this.playTone(554.37, now + 0.12, 0.35, 'sine', 0.25);
        }
    }

    playSubBass(startTime, duration = 0.5) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, startTime);
        osc.frequency.exponentialRampToValueAtTime(35, startTime + duration);
        gain.gain.setValueAtTime(0.7, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playTone(freq, time, duration, type = 'sine', volume = 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
    }

    // Button click tactile sound
    playButton() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        this.playTone(800, now, 0.05, 'triangle', 0.2);
    }
}

// Global audio singleton
window.soundEngine = new SoundEngine();
