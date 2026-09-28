// =========================================================
// PHOTOBOOTH STATION - LIVING WORLD & INTERACTION ENGINE
// Transforms the photobooth into a tactile, living mechanical toy
// with organic micro-interactions, synthesized retro audio,
// petting physics, post-meal tummy reactions, and ambient life.
// =========================================================

const PTBWorld = {

    // Audio Engine State
    audioCtx: null,
    soundEnabled: true,

    // Petting & Touch State
    isPetting: false,
    petStrokes: [],
    petTimeout: null,

    // Anticipation State
    isHoveringTake: false,
    takeSighTimeout: null,

    // Ambient Firefly State
    fireflyEl: null,
    fireflyActive: false,
    fireflyAnimId: null,
    fireflyStartTime: 0,
    idleTimer: null,
    lastActivity: Date.now(),

    // Easter Egg State
    keyBuffer: '',
    shadesEl: null,
    shadesTimeout: null,
    titleClicks: 0,
    titleClickTimeout: null,

    init() {
        this.initSoundToggle();
        this.initCreatureInteraction();
        this.initTakeButtonDynamics();
        this.initPostMealReactions();
        this.initMemoriesInteractions();
        this.initThemeAtmosphere();
        this.initRubberStamp();
        this.initAmbientLife();
        this.initEasterEggs();

        // Unlock audio on first user gesture anywhere
        const unlockAudio = () => {
            this.getAudioContext();
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio, { once: true });
        window.addEventListener('keydown', unlockAudio, { once: true });
    },

    // =========================================================
    // 1. SYNTHESIZED WEB AUDIO ENGINE (ZERO EXTERNAL ASSETS)
    // =========================================================
    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    },

    initSoundToggle() {
        // Retrieve stored user preference (default: ON)
        const stored = localStorage.getItem('ptb_sound_enabled');
        if (stored !== null) {
            this.soundEnabled = stored === 'true';
        }

        const soundBtn = document.getElementById('sound_toggle_btn');
        if (soundBtn) {
            this.updateSoundButtonUI(soundBtn);
            soundBtn.addEventListener('click', () => {
                this.soundEnabled = !this.soundEnabled;
                localStorage.setItem('ptb_sound_enabled', String(this.soundEnabled));
                this.updateSoundButtonUI(soundBtn);
                if (this.soundEnabled) {
                    this.play('click', 750);
                }
            });
        }
    },

    updateSoundButtonUI(btn) {
        if (!btn) return;
        const label = btn.querySelector('.btn_label');
        if (label) {
            label.textContent = this.soundEnabled ? 'Sound: ON' : 'Sound: OFF';
        }
        if (this.soundEnabled) {
            btn.classList.add('sound_active');
            btn.classList.remove('sound_muted');
        } else {
            btn.classList.remove('sound_active');
            btn.classList.add('sound_muted');
        }
    },

    play(soundType, param = null) {
        if (!this.soundEnabled) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            switch (soundType) {
                case 'click': {
                    // Tactile neo-brutalist mechanical snap
                    const freq = param || 620;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    osc.frequency.exponentialRampToValueAtTime(120, now + 0.028);

                    gain.gain.setValueAtTime(0.22, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                }

                case 'shutter': {
                    // Authentic dual-leaf mechanical shutter click + motor recoil
                    // 1. Initial click
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(60, now + 0.045);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.055);

                    // 2. High noise transient blade snap
                    const bufferSize = ctx.sampleRate * 0.04;
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
                    }
                    const noise = ctx.createBufferSource();
                    noise.buffer = buffer;
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.value = 2400;
                    filter.Q.value = 1.2;
                    const noiseGain = ctx.createGain();
                    noiseGain.gain.setValueAtTime(0.28, now);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(ctx.destination);
                    noise.start(now);

                    // 3. Second blade closing click
                    setTimeout(() => {
                        if (!this.soundEnabled || !this.audioCtx) return;
                        const t2 = this.audioCtx.currentTime;
                        const osc2 = this.audioCtx.createOscillator();
                        const g2 = this.audioCtx.createGain();
                        osc2.type = 'sine';
                        osc2.frequency.setValueAtTime(450, t2);
                        osc2.frequency.exponentialRampToValueAtTime(90, t2 + 0.06);
                        g2.gain.setValueAtTime(0.3, t2);
                        g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.065);
                        osc2.connect(g2);
                        g2.connect(this.audioCtx.destination);
                        osc2.start(t2);
                        osc2.stop(t2 + 0.07);
                    }, 65);
                    break;
                }

                case 'windup': {
                    // Clockwork ratchet tick
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(param || 920, now);
                    osc.frequency.exponentialRampToValueAtTime(320, now + 0.02);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.03);
                    break;
                }

                case 'flash': {
                    // Bright flash ionization pop + gentle capacitor shimmer
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1400, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.09);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.13);
                    break;
                }

                case 'purr': {
                    // Warm, harmonic kitten-like purr / chirp when creature is petted
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    const baseFreq = 480 + (Math.random() * 80);
                    osc.frequency.setValueAtTime(baseFreq, now);
                    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.08);
                    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

                    gain.gain.setValueAtTime(0.01, now);
                    gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.22);
                    break;
                }

                case 'squeak': {
                    // Playful rubber-toy squeak when booping the + patch
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(1650, now + 0.07);
                    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.14);

                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.16);
                    break;
                }

                case 'bubble': {
                    // Cartoon water pop / burp bubble
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(520, now);
                    osc.frequency.exponentialRampToValueAtTime(1380, now + 0.09);

                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.12);
                    break;
                }

                case 'stamp': {
                    // Deep rubber ink stamp thud
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(120, now);
                    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.11);
                    break;
                }

                case 'chomp': {
                    // Comedic cartoon photo chomp
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);

                    gain.gain.setValueAtTime(0.28, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.11);
                    break;
                }

                case 'tada': {
                    // Easter egg celebratory mini-fanfare
                    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                    notes.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const t = now + (idx * 0.09);
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, t);
                        gain.gain.setValueAtTime(0.22, t);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(t);
                        osc.stop(t + 0.3);
                    });
                    break;
                }

                case 'sneeze_inhale': {
                    // Gradual rising gasp / vacuum hiss
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.exponentialRampToValueAtTime(950, now + 1.2);
                    gain.gain.setValueAtTime(0.01, now);
                    gain.gain.linearRampToValueAtTime(0.22, now + 1.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 1.35);
                    break;
                }

                case 'sneeze_blast': {
                    // Explosive cartoon sneeze blast: deep sub-boom + noise transient
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.exponentialRampToValueAtTime(28, now + 0.35);
                    gain.gain.setValueAtTime(0.65, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.42);

                    // High noise burst
                    const bufSize = ctx.sampleRate * 0.18;
                    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < bufSize; i++) {
                        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2));
                    }
                    const noise = ctx.createBufferSource();
                    noise.buffer = buf;
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.value = 1600;
                    const noiseGain = ctx.createGain();
                    noiseGain.gain.setValueAtTime(0.45, now);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(ctx.destination);
                    noise.start(now);
                    break;
                }

                case 'rewind_clack': {
                    // Magnetic spring whoosh and rapid wooden snap-clacks
                    const steps = [420, 560, 680, 850];
                    steps.forEach((freq, i) => {
                        const t = now + (i * 0.05);
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(freq, t);
                        osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);
                        gain.gain.setValueAtTime(0.24, t);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(t);
                        osc.stop(t + 0.045);
                    });
                    break;
                }

                case 'whip_snatch': {
                    // Fast cartoon whoosh / whip crack
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(950, now);
                    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.11);
                    break;
                }

                case 'rubber_stretch': {
                    // Dynamic rubber-band pitch stretch
                    const freq = param || 240;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    gain.gain.setValueAtTime(0.16, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.09);
                    break;
                }

                case 'raspberry': {
                    // Comedic cartoon tongue raspberry (pbtthhh)
                    const osc = ctx.createOscillator();
                    const mod = ctx.createOscillator();
                    const modGain = ctx.createGain();
                    const gain = ctx.createGain();

                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(110, now);
                    osc.frequency.linearRampToValueAtTime(75, now + 0.35);

                    mod.type = 'square';
                    mod.frequency.setValueAtTime(32, now); // 32Hz flutter modulation
                    modGain.gain.setValueAtTime(45, now);

                    mod.connect(osc.frequency);

                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    mod.start(now);
                    osc.start(now);
                    mod.stop(now + 0.4);
                    osc.stop(now + 0.4);
                    break;
                }

                case 'chain_pull': {
                    // Tactile metallic brass pull-chain rattle and snap
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(1400, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;
                }

                case 'ballast_hum': {
                    // Analog fluorescent ballast hum (toggle on/off)
                    if (this._ballastOsc) {
                        try {
                            this._ballastOsc.stop();
                            this._ballastOsc.disconnect();
                        } catch (e) {}
                        this._ballastOsc = null;
                        break;
                    }
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(60, now); // 60Hz mains hum
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.linearRampToValueAtTime(0.04, now + 0.3);

                    // Low-pass to keep it warm and analog
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.value = 240;

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    this._ballastOsc = osc;
                    this._ballastGain = gain;
                    break;
                }

                case 'flicker': {
                    // Stuttering fluorescent lamp ignition click
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(320 + Math.random() * 200, now);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.03);
                    break;
                }

                case 'light_spark': {
                    // Soft crystalline spark when drawing with light
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(param || (800 + Math.random() * 400), now);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.06);
                    break;
                }
            }
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    },


    // =========================================================
    // 2. CREATURE TACTILE PETTING & PHYSICAL REACTIONS
    // =========================================================
    initCreatureInteraction() {
        const head = document.querySelector('.creature_head');
        const patch = document.querySelector('.creature_patch');
        const armLeft = document.querySelector('.creature_arm.arm_left');
        const armRight = document.querySelector('.creature_arm.arm_right');

        if (!head) return;

        // A. Petting Detection on Head (User moving mouse back & forth across forehead)
        head.addEventListener('mousemove', (e) => {
            this.recordActivity();
            if (!window.Creature || window.Creature.isSleeping || window.Creature.state === 'EATING') return;

            const now = Date.now();
            this.petStrokes.push({ x: e.clientX, time: now });
            this.petStrokes = this.petStrokes.filter(s => now - s.time < 900);

            // Check for directional reversals (stroking)
            if (this.petStrokes.length >= 4) {
                let reversals = 0;
                for (let i = 2; i < this.petStrokes.length; i++) {
                    const dx1 = this.petStrokes[i - 1].x - this.petStrokes[i - 2].x;
                    const dx2 = this.petStrokes[i].x - this.petStrokes[i - 1].x;
                    if ((dx1 > 4 && dx2 < -4) || (dx1 < -4 && dx2 > 4)) {
                        reversals++;
                    }
                }

                if (reversals >= 2) {
                    this.triggerPetting(e.clientX, e.clientY);
                }
            }
        });

        head.addEventListener('mouseleave', () => {
            if (this.isPetting) {
                this.stopPetting();
            }
        });

        // B. Boop the Handmade Stitch Patch (+)
        if (patch) {
            patch.style.cursor = 'pointer';
            patch.addEventListener('click', (e) => {
                e.stopPropagation();
                this.recordActivity();
                if (!window.Creature) return;

                this.play('squeak');
                this.spawnEmote(e.clientX, e.clientY, '✨');

                if (window.Creature.isSleeping) {
                    window.Creature.wakeUp();
                    return;
                }

                window.Creature.blink(true, 'right'); // playful wink
                window.Creature.twitchEar('right');
                patch.classList.add('patch_booped');
                setTimeout(() => patch.classList.remove('patch_booped'), 350);
            });
        }

        // C. High-Five / Paw Tickle
        [armLeft, armRight].forEach((arm, idx) => {
            if (!arm) return;
            arm.style.cursor = 'pointer';
            arm.addEventListener('click', (e) => {
                e.stopPropagation();
                this.recordActivity();
                this.play('click', 720);
                this.spawnEmote(e.clientX, e.clientY, '🐾');

                if (window.Creature) {
                    window.Creature.twitchEar(idx === 0 ? 'left' : 'right');
                    window.Creature.setMouthState('curious');
                    setTimeout(() => window.Creature.resetToIdle(), 600);
                }
            });
        });
    },

    triggerPetting(cursorX, cursorY) {
        if (!window.Creature) return;
        this.isPetting = true;
        window.Creature.overrideLook = true;
        window.Creature.setEyeExpression('happy');
        window.Creature.setMouthState('pleased');

        if (window.Creature.shell) {
            window.Creature.shell.classList.add('ear_flutter');
        }

        this.play('purr');

        // Spawn a gentle floating heart or sparkle
        if (Math.random() < 0.35) {
            const emote = Math.random() < 0.65 ? '💛' : '✨';
            this.spawnEmote(cursorX, cursorY - 15, emote);
        }

        clearTimeout(this.petTimeout);
        this.petTimeout = setTimeout(() => {
            this.stopPetting();
        }, 1100);
    },

    stopPetting() {
        this.isPetting = false;
        this.petStrokes = [];
        if (!window.Creature) return;

        if (window.Creature.shell) {
            window.Creature.shell.classList.remove('ear_flutter');
        }

        window.Creature.blink();
        setTimeout(() => {
            if (!this.isPetting && window.Creature) {
                window.Creature.resetToIdle();
            }
        }, 300);
    },

    spawnEmote(x, y, symbol) {
        const emote = document.createElement('span');
        emote.className = 'creature_emote_float';
        emote.textContent = symbol;

        const dx = (Math.random() * 60 - 30);
        const rot = (Math.random() * 30 - 15);
        emote.style.setProperty('--emote-dx', `${dx}px`);
        emote.style.setProperty('--emote-rot', `${rot}deg`);
        emote.style.left = `${x}px`;
        emote.style.top = `${y}px`;

        document.body.appendChild(emote);
        setTimeout(() => emote.remove(), 900);
    },


    // =========================================================
    // 3. TAKE BUTTON ANTICIPATION & EMOTIVE SIGH
    // =========================================================
    initTakeButtonDynamics() {
        const takeBtn = document.querySelector('.takephoto_btn');
        if (!takeBtn) return;

        takeBtn.addEventListener('mouseenter', () => {
            this.recordActivity();
            const appState = window.state || {};
            if (appState.isCapturing || !window.Creature || window.Creature.isSleeping) return;

            this.isHoveringTake = true;
            clearTimeout(this.takeSighTimeout);

            // Creature leans forward and anticipates the photo!
            if (window.Creature.shell) {
                window.Creature.shell.classList.add('take_hover_anticipation');
            }
            window.Creature.lookAt(-50, -16);
            window.Creature.setMouthState('curious');
            this.play('windup', 840);
        });

        takeBtn.addEventListener('mouseleave', () => {
            this.isHoveringTake = false;
            const appState = window.state || {};
            if (appState.isCapturing || !window.Creature || window.Creature.isSleeping) return;

            if (window.Creature.shell) {
                window.Creature.shell.classList.remove('take_hover_anticipation');
            }

            // If user backed away without taking a photo, creature sighs with a cute pout!
            window.Creature.setMouthState('pout');
            window.Creature.lookAt(-50, -50);
            this.takeSighTimeout = setTimeout(() => {
                if (!this.isHoveringTake && window.Creature) {
                    window.Creature.resetToIdle();
                }
            }, 1400);
        });

        takeBtn.addEventListener('click', () => {
            this.recordActivity();
            this.play('click', 440);
            if (window.Creature && window.Creature.shell) {
                window.Creature.shell.classList.remove('take_hover_anticipation');
            }
        });
    },


    // =========================================================
    // 4. POST-MEAL LIVING BELLY & BUBBLE BURP
    // =========================================================
    initPostMealReactions() {
        if (!window.Creature) return;

        const originalEatPhoto = window.Creature.eatPhoto.bind(window.Creature);
        window.Creature.eatPhoto = (imgDataUrl) => {
            this.play('chomp');
            return originalEatPhoto(imgDataUrl).then(() => {
                this.schedulePostMealReaction();
            });
        };
    },

    schedulePostMealReaction() {
        // 3.2 seconds after finishing the meal, creature does a cute "belly wiggle",
        // pops a cartoon bubble from its mouth, and pats its belly!
        setTimeout(() => {
            if (!window.Creature || window.Creature.isSleeping || window.Creature.state === 'COUNTDOWN') return;

            const shell = window.Creature.shell;
            const mouth = window.Creature.mouth;
            if (!shell || !mouth) return;

            // Belly wiggle
            shell.classList.add('belly_wiggle');
            window.Creature.setMouthState('open');

            // Float cartoon bubble from mouth
            const bubble = document.createElement('div');
            bubble.className = 'creature_burp_bubble';
            mouth.parentElement.appendChild(bubble);

            this.play('bubble');

            setTimeout(() => {
                bubble.remove();
                shell.classList.remove('belly_wiggle');
                shell.classList.add('paw_pat');
                window.Creature.setMouthState('pleased');

                // Pat belly for 1.1s, then return to calm
                setTimeout(() => {
                    shell.classList.remove('paw_pat');
                    if (window.Creature) {
                        window.Creature.resetToIdle();
                    }
                }, 1100);
            }, 1200);

        }, 3200);
    },


    // =========================================================
    // 5. MEMORIES PANEL - 3D PERSPECTIVE TILT & INSPECTION
    // =========================================================
    initMemoriesInteractions() {
        const historyList = document.getElementById('history_list');
        if (!historyList) return;

        // Use event delegation for dynamically added memories
        historyList.addEventListener('mousemove', (e) => {
            this.recordActivity();
            const card = e.target.closest('.history_item');
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            // Subtle tactile 3D tilt
            const rotX = ((cy - y) / cy) * 7.5;
            const rotY = ((x - cx) / cx) * 7.5;

            const img = card.querySelector('img');
            if (img) {
                img.style.transform = `perspective(500px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(1.02)`;
            }
        });

        historyList.addEventListener('mouseleave', () => {
            const items = historyList.querySelectorAll('.history_item img');
            items.forEach(img => {
                img.style.transform = '';
            });
            if (window.Creature) {
                window.Creature.onMemoryLeave();
            }
        }, true);

        historyList.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.history_item');
            if (card && window.Creature) {
                window.Creature.onMemoryHover();
            }
        });
    },


    // =========================================================
    // 6. THEME ATMOSPHERE & INK-SWEEP REACTION
    // =========================================================
    initThemeAtmosphere() {
        const swatches = document.querySelectorAll('.theme_swatch_btn');
        swatches.forEach(btn => {
            btn.addEventListener('click', () => {
                this.recordActivity();
                const theme = btn.getAttribute('data-theme');
                this.play('click', 580);

                // Add a momentary tactile ink-shift class to layout
                const layout = document.querySelector('.app_layout');
                if (layout) {
                    layout.classList.add('theme_morphing');
                    setTimeout(() => layout.classList.remove('theme_morphing'), 320);
                }

                // Theme-specific creature micro-reactions
                if (window.Creature && !window.Creature.isSleeping) {
                    if (theme === 'pastel') {
                        window.Creature.twitchEar('left');
                        window.Creature.setMouthState('curious');
                    } else if (theme === 'sage') {
                        window.Creature.setEyeExpression('sleepy');
                        setTimeout(() => window.Creature.resetToIdle(), 1200);
                    } else if (theme === 'midnight') {
                        window.Creature.setEyeExpression('wide');
                        setTimeout(() => window.Creature.resetToIdle(), 900);
                    }
                }
            });
        });
    },


    // =========================================================
    // 7. INTERACTIVE RETRO DATE STAMP
    // =========================================================
    initRubberStamp() {
        const stampBtn = document.getElementById('stamp_toggle_btn');
        if (!stampBtn) return;

        stampBtn.addEventListener('click', () => {
            this.recordActivity();
            this.play('stamp');

            stampBtn.classList.add('stamp_thump');
            setTimeout(() => stampBtn.classList.remove('stamp_thump'), 220);
        });
    },


    // =========================================================
    // 8. AMBIENT WONDERING FIREFLY (ORGANIC IDLE LIFE)
    // =========================================================
    initAmbientLife() {
        // Create the firefly element
        this.fireflyEl = document.createElement('div');
        this.fireflyEl.className = 'ambient_firefly';
        this.fireflyEl.innerHTML = `
            <div class="firefly_body">
                <span class="firefly_wing_left"></span>
                <span class="firefly_wing_right"></span>
            </div>
        `;
        document.body.appendChild(this.fireflyEl);

        // Track global user activity to determine idle time
        const resetIdle = () => this.recordActivity();
        window.addEventListener('mousemove', resetIdle, { passive: true });
        window.addEventListener('pointerdown', resetIdle, { passive: true });
        window.addEventListener('keydown', resetIdle, { passive: true });

        // Check for idle every 3 seconds
        setInterval(() => this.checkAmbientSpawn(), 3000);
    },

    recordActivity() {
        this.lastActivity = Date.now();
        if (this.fireflyActive) {
            this.scareFirefly();
        }
    },

    checkAmbientSpawn() {
        if (this.fireflyActive) return;
        if (window.Creature && (window.Creature.isSleeping || window.Creature.state === 'COUNTDOWN' || window.Creature.state === 'EATING')) return;

        const idleDuration = Date.now() - this.lastActivity;
        // User is idle between 12s and 30s (before deep sleep starts)
        if (idleDuration >= 12000 && idleDuration <= 34000) {
            this.spawnFirefly();
        }
    },

    spawnFirefly() {
        if (this.fireflyActive || !this.fireflyEl || !window.Creature) return;
        this.fireflyActive = true;
        this.fireflyStartTime = Date.now();

        const shellRect = window.Creature.shell ? window.Creature.shell.getBoundingClientRect() : null;
        if (!shellRect) return;

        this.fireflyEl.classList.add('visible');

        // Parametric flight path around creature viewport
        const originX = shellRect.left + shellRect.width / 2;
        const originY = shellRect.top + shellRect.height * 0.45;
        const radiusX = shellRect.width * 0.38;
        const radiusY = shellRect.height * 0.28;

        const animateFly = () => {
            if (!this.fireflyActive) return;

            const t = (Date.now() - this.fireflyStartTime) * 0.0016;
            // Smooth Lissajous curve
            const curX = originX + Math.sin(t * 1.2) * radiusX + Math.sin(t * 2.8) * 24;
            const curY = originY + Math.cos(t * 0.9) * radiusY + Math.cos(t * 3.1) * 18;

            this.fireflyEl.style.transform = `translate(${curX}px, ${curY}px)`;

            // Creature tracks firefly position!
            if (window.Creature && !window.Creature.isSleeping && window.Creature.state !== 'EATING') {
                const headRect = window.Creature.shell.getBoundingClientRect();
                const relX = ((curX - (headRect.left + headRect.width / 2)) / (headRect.width / 2)) * 38 - 50;
                const relY = ((curY - (headRect.top + 30)) / (headRect.height / 2)) * 38 - 50;
                window.Creature.lookAt(relX, relY);
            }

            // Fly for max 12 seconds before naturally drifting off
            if (Date.now() - this.fireflyStartTime > 12000) {
                this.scareFirefly();
                return;
            }

            this.fireflyAnimId = requestAnimationFrame(animateFly);
        };

        this.fireflyAnimId = requestAnimationFrame(animateFly);
    },

    scareFirefly() {
        if (!this.fireflyActive) return;
        this.fireflyActive = false;
        cancelAnimationFrame(this.fireflyAnimId);

        if (this.fireflyEl) {
            // Dart upward quickly
            this.fireflyEl.style.transition = 'transform 0.4s ease-in, opacity 0.35s ease-out';
            this.fireflyEl.style.opacity = '0';
            this.fireflyEl.style.transform += ' translateY(-120px) scale(0.4)';

            setTimeout(() => {
                this.fireflyEl.classList.remove('visible');
                this.fireflyEl.style.transition = '';
            }, 450);
        }

        // Creature double-blinks in surprise
        if (window.Creature && !window.Creature.isSleeping) {
            window.Creature.blink(true);
            setTimeout(() => {
                if (window.Creature) window.Creature.resetToIdle();
            }, 400);
        }
    },


    // =========================================================
    // 9. SECRET EASTER EGGS
    // =========================================================
    initEasterEggs() {
        // A. Keyboard Secrets ("cheese" or "smile")
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            this.keyBuffer += e.key.toLowerCase();
            if (this.keyBuffer.length > 12) {
                this.keyBuffer = this.keyBuffer.slice(-12);
            }

            if (this.keyBuffer.includes('cheese') || this.keyBuffer.includes('smile')) {
                this.keyBuffer = '';
                this.triggerPartyMode();
            }
        });

        // B. Title Triple-Click Celebration
        const titleEl = document.querySelector('.brand_section .title');
        if (titleEl) {
            titleEl.style.cursor = 'pointer';
            titleEl.addEventListener('click', (e) => {
                this.recordActivity();
                this.titleClicks++;
                clearTimeout(this.titleClickTimeout);

                if (this.titleClicks >= 3) {
                    this.titleClicks = 0;
                    this.triggerPartyMode(e.clientX, e.clientY);
                } else {
                    this.titleClickTimeout = setTimeout(() => {
                        this.titleClicks = 0;
                    }, 500);
                }
            });
        }
    },

    triggerPartyMode(originX = null, originY = null) {
        this.play('tada');

        // Creature equips sunglasses
        if (!this.shadesEl) {
            this.shadesEl = document.createElement('div');
            this.shadesEl.className = 'creature_shades';
            this.shadesEl.innerHTML = `
                <div class="shade_bridge"></div>
                <div class="shade_lens"><div class="shade_glare"></div></div>
                <div class="shade_lens"><div class="shade_glare"></div></div>
            `;
            const head = document.querySelector('.creature_head');
            if (head) head.appendChild(this.shadesEl);
        }

        setTimeout(() => {
            if (this.shadesEl) this.shadesEl.classList.add('active');
        }, 50);

        if (window.Creature) {
            window.Creature.setMouthState('pleased');
            window.Creature.twitchEar('left');
            setTimeout(() => window.Creature.twitchEar('right'), 200);
        }

        // Burst confetti
        const x = originX || window.innerWidth / 2;
        const y = originY || window.innerHeight * 0.4;
        this.spawnConfettiBurst(x, y);

        // Remove sunglasses after 5 seconds
        clearTimeout(this.shadesTimeout);
        this.shadesTimeout = setTimeout(() => {
            if (this.shadesEl) this.shadesEl.classList.remove('active');
            if (window.Creature) {
                window.Creature.blink(true);
                window.Creature.resetToIdle();
            }
        }, 5000);
    },

    spawnConfettiBurst(cx, cy) {
        const colors = ['#ffe600', '#6C7EE1', '#FBA2D0', '#B0D4B8', '#E17A8D', '#121212', '#ffffff'];
        const count = 32;

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'ptb_confetti_particle';
            p.style.backgroundColor = colors[i % colors.length];

            const angle = (i / count) * Math.PI * 2;
            const velocity = 80 + Math.random() * 160;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity + (Math.random() * 80);
            const rot = Math.random() * 720 - 360;

            p.style.setProperty('--cf-x', `${tx}px`);
            p.style.setProperty('--cf-y', `${ty}px`);
            p.style.setProperty('--cf-r', `${rot}deg`);

            p.style.left = `${cx}px`;
            p.style.top = `${cy}px`;

            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1250);
        }
    }
};

window.PTBWorld = PTBWorld;

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PTBWorld.init());
} else {
    setTimeout(() => PTBWorld.init(), 150);
}
