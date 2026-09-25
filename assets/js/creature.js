// =========================================================
// CAMERA CREATURE - AUTONOMOUS PERSONALITY & INTERACTION ENGINE
// Transforms the camera into a living creature that physically
// surrounds the webcam, reacts to the user, and eats photos!
// =========================================================

const Creature = {

    // DOM Elements
    shell: null,
    leftEye: null,
    rightEye: null,
    leftPupil: null,
    rightPupil: null,
    mouth: null,
    swallowEl: null,

    // Species / Archetype (Persisted per session)
    species: 'CURIOUS', // 'CURIOUS' | 'SLEEPY' | 'MISCHIEVOUS' | 'SHY' | 'ENERGETIC'

    // Internal Mood System (Invisible to user)
    mood: 'CALM', // 'CALM' | 'CURIOUS' | 'BORED' | 'EXCITED' | 'CONFUSED' | 'SLEEPY' | 'ANNOYED'
    lastMoodChange: 0,
    lastUserActivity: Date.now(),
    recentPhotoTimes: [],

    // Life State
    state: 'IDLE', // 'IDLE' | 'ATTENTIVE' | 'LOOKING_UI' | 'COUNTDOWN' | 'FLASH_WINCE' | 'EATING' | 'REACTING_PHOTO' | 'RARE_EVENT' | 'SLEEPING'
    isBlinking: false,
    overrideLook: false,
    isSleeping: false,
    sleepStartTime: 0,

    // Timers & Schedulers
    actionTimer: null,
    blinkTimer: null,
    attentionLossTimer: null,
    sleepZTimer: null,
    ignoreCursorUntil: 0,

    // Current Gaze Coordinates
    currentLx: -50,
    currentLy: -50,
    currentRx: -50,
    currentRy: -50,

    // Mouse Tracking Physics & Jiggle Detection
    lastMouseX: null,
    lastMouseY: null,
    lastMouseMoveTime: 0,
    jiggleHistory: [],
    cursorInTerritory: false,

    init() {
        this.shell = document.getElementById('camera_creature');
        if (!this.shell) return;

        this.leftEye = this.shell.querySelector('.eye_left');
        this.rightEye = this.shell.querySelector('.eye_right');
        this.leftPupil = this.shell.querySelector('.eye_left .creature_pupil');
        this.rightPupil = this.shell.querySelector('.eye_right .creature_pupil');
        this.mouth = document.getElementById('creature_mouth');
        this.swallowEl = document.getElementById('flying_photo_swallow');

        if (!this.leftPupil || !this.rightPupil) return;

        // 1. Initialize Species Archetype
        this.initSpecies();

        // Sync initial state accessories
        const appState = window.state || (typeof state !== 'undefined' ? state : null);
        if (appState) {
            this.setTimerActive(appState.timer > 0);
            if (this.shell && (appState.currentFilter !== 'none' || (appState.currentCamanPreset && appState.currentCamanPreset !== 'none'))) {
                this.shell.classList.add('filter_active');
            }
        }

        // 2. Start Organic Autonomous Life Loop
        this.scheduleNextAction();
        this.scheduleNextBlink();

        // 3. Register Territory, Attention & Fourth-Wall Listeners
        this.setupEventListeners();
    },

    // -----------------------------------------------------
    // 1. SPECIES / ARCHETYPE SYSTEM
    // -----------------------------------------------------
    initSpecies() {
        const speciesList = ['CURIOUS', 'SLEEPY', 'MISCHIEVOUS', 'SHY', 'ENERGETIC'];
        let stored = null;
        try {
            stored = sessionStorage.getItem('creature_species_variant');
        } catch (e) {}

        if (stored && speciesList.includes(stored)) {
            this.species = stored;
        } else {
            this.species = speciesList[Math.floor(Math.random() * speciesList.length)];
            try {
                sessionStorage.setItem('creature_species_variant', this.species);
            } catch (e) {}
        }

        this.shell.classList.add(`species_${this.species.toLowerCase()}`);
    },

    // -----------------------------------------------------
    // 2. MOOD ENGINE
    // -----------------------------------------------------
    setMood(newMood) {
        if (this.mood === newMood) return;
        const now = Date.now();
        // Prevent jarring, hyperactive mood changes (min 4.5s between changes unless critical)
        if (now - this.lastMoodChange < 4500 && newMood !== 'SLEEPY' && newMood !== 'EXCITED' && newMood !== 'ANNOYED') {
            return;
        }

        this.mood = newMood;
        this.lastMoodChange = now;

        if (newMood === 'SLEEPY') {
            this.setEyeExpression('sleepy');
            this.setMouthState('normal');
        } else if (newMood === 'ANNOYED') {
            this.setEyeExpression('squint');
            this.setMouthState('pout');
        } else if (newMood === 'EXCITED') {
            this.setEyeExpression('wide');
            this.setMouthState('curious');
        } else if (newMood === 'CALM') {
            if (this.state === 'IDLE') {
                this.setEyeExpression('normal');
                this.setMouthState('normal');
            }
        }
    },

    updateMoodFromActivity() {
        if (this.isSleeping || this.overrideLook) return;
        const now = Date.now();
        const idleTime = now - this.lastUserActivity;

        // Long period of no activity -> BORED, SLEEPY, or deeply ASLEEP
        if (idleTime > 48000) {
            this.goToSleep();
        } else if (idleTime > 32000) {
            this.setMood('SLEEPY');
        } else if (idleTime > 16000) {
            this.setMood(this.species === 'SLEEPY' ? 'SLEEPY' : 'BORED');
        } else if (idleTime < 5000 && this.mood === 'BORED') {
            this.setMood('CURIOUS');
        }
    },

    recordUserActivity() {
        this.lastUserActivity = Date.now();
        if (this.isSleeping) {
            this.wakeUp();
        } else if (this.mood === 'BORED' || this.mood === 'SLEEPY') {
            // Gradually wake up / re-engage
            this.setMood('CALM');
        }
    },

    // -----------------------------------------------------
    // 3. PUPILS & GAZE CONTROLLER (SYNCHRONOUS & INDEPENDENT)
    // -----------------------------------------------------
    lookAt(lx, ly, rx, ry) {
        if (this.isBlinking) return;

        const clx = Math.max(-88, Math.min(-12, lx));
        const cly = Math.max(-88, Math.min(-12, ly));
        const crx = rx !== undefined ? Math.max(-88, Math.min(-12, rx)) : clx;
        const cry = ry !== undefined ? Math.max(-88, Math.min(-12, ry)) : cly;

        this.currentLx = clx;
        this.currentLy = cly;
        this.currentRx = crx;
        this.currentRy = cry;

        if (this.leftPupil) this.leftPupil.style.transform = `translate(${clx}%, ${cly}%)`;
        if (this.rightPupil) this.rightPupil.style.transform = `translate(${crx}%, ${cry}%)`;
    },

    resetLook() {
        this.lookAt(-50, -50);
        if (this.mood === 'SLEEPY') {
            this.setEyeExpression('sleepy');
        } else if (this.mood === 'ANNOYED') {
            this.setEyeExpression('squint');
        } else {
            this.setEyeExpression('normal');
        }
        this.setMouthState(this.mood === 'ANNOYED' ? 'pout' : 'normal');
    },

    setEyeExpression(expression, whichEye = 'both') {
        const targets = [];
        if (whichEye === 'both' || whichEye === 'left') targets.push(this.leftEye);
        if (whichEye === 'both' || whichEye === 'right') targets.push(this.rightEye);

        targets.forEach(eye => {
            if (!eye) return;
            eye.classList.remove('eye_blink', 'eye_wince', 'eye_wide', 'eye_sleepy', 'eye_closed', 'eye_squint');
            if (expression && expression !== 'normal') {
                eye.classList.add(`eye_${expression}`);
            }
        });
    },

    setMouthState(stateName) {
        if (!this.mouth) return;
        this.mouth.classList.remove('mouth_curious', 'mouth_open', 'mouth_eating', 'mouth_pout', 'mouth_pleased', 'mouth_sleep');
        if (stateName && stateName !== 'normal') {
            this.mouth.classList.add(`mouth_${stateName}`);
        }
    },

    twitchEar(side = 'random') {
        if (!this.shell) return;
        const which = side === 'random' ? (Math.random() < 0.5 ? 'left' : 'right') : side;
        const cls = which === 'left' ? 'ear_twitch_left' : 'ear_twitch_right';
        this.shell.classList.add(cls);
        setTimeout(() => this.shell.classList.remove(cls), 280);
    },

    // -----------------------------------------------------
    // 4. NATURAL ORGANIC BLINKING
    // -----------------------------------------------------
    blink(isDouble = false, whichEye = 'both') {
        if (this.isBlinking || this.isSleeping) return;
        this.isBlinking = true;
        this.setEyeExpression('blink', whichEye);

        setTimeout(() => {
            // Restore previous expression
            const baseExpr = this.mood === 'SLEEPY' ? 'sleepy' : (this.mood === 'ANNOYED' ? 'squint' : 'normal');
            this.setEyeExpression(baseExpr, whichEye);
            this.isBlinking = false;

            if (isDouble) {
                setTimeout(() => {
                    this.isBlinking = true;
                    this.setEyeExpression('blink', whichEye);
                    setTimeout(() => {
                        this.setEyeExpression(baseExpr, whichEye);
                        this.isBlinking = false;
                    }, 85);
                }, 120);
            }
        }, 110);
    },

    scheduleNextBlink() {
        let baseDelay = 3200;
        let spread = 4000;

        if (this.mood === 'SLEEPY') {
            baseDelay = 2200; // Slower, heavier blinking
            spread = 2800;
        } else if (this.mood === 'EXCITED') {
            baseDelay = 1800;
            spread = 3200;
        }

        const delay = baseDelay + Math.random() * spread;
        clearTimeout(this.blinkTimer);
        this.blinkTimer = setTimeout(() => {
            if (!this.isSleeping && this.state !== 'EATING') {
                const isDouble = Math.random() < 0.22;
                this.blink(isDouble);
            }
            this.scheduleNextBlink();
        }, delay);
    },

    // -----------------------------------------------------
    // 5. THE AUTONOMOUS BEHAVIOR TICK (ORGANIC, QUIET, RARE)
    // -----------------------------------------------------
    scheduleNextAction() {
        let minDelay = 4200;
        let maxDelay = 8500;

        if (this.species === 'SLEEPY' || this.mood === 'SLEEPY') {
            minDelay = 5800;
            maxDelay = 11000;
        } else if (this.species === 'ENERGETIC' || this.mood === 'EXCITED') {
            minDelay = 2600;
            maxDelay = 5200;
        }

        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        clearTimeout(this.actionTimer);
        this.actionTimer = setTimeout(() => {
            this.updateMoodFromActivity();
            if (!this.overrideLook && !this.isSleeping && this.state !== 'EATING' && this.state !== 'COUNTDOWN' && this.state !== 'REACTING_PHOTO') {
                this.performAutonomousAction();
            }
            this.scheduleNextAction();
        }, delay);
    },

    performAutonomousAction() {
        // PRINCIPLE: The creature spends MOST of its time doing nothing / resting!
        // 60-70% of ticks are pure silence (gentle look forward).
        const stillnessChance = this.mood === 'EXCITED' ? 0.35 : 0.65;
        if (Math.random() < stillnessChance) {
            // Calm stillness, looks straight at the user
            if (this.state !== 'IDLE') {
                this.resetToIdle();
            }
            return;
        }

        // Check for Rare Events / Easter Eggs (infrequent!)
        const rareChance = this.species === 'MISCHIEVOUS' ? 0.18 : 0.07;
        if (Math.random() < rareChance) {
            this.triggerRareEasterEgg();
            return;
        }

        // Standard subtle personality actions:
        const roll = Math.random();

        if (roll < 0.25) {
            // Glance slightly left (daydreaming)
            this.state = 'LOOKING_UI';
            this.lookAt(-72, -50);
            setTimeout(() => { if (this.state === 'LOOKING_UI') this.resetToIdle(); }, 1000 + Math.random() * 800);

        } else if (roll < 0.50) {
            // Glance slightly right
            this.state = 'LOOKING_UI';
            this.lookAt(-28, -50);
            setTimeout(() => { if (this.state === 'LOOKING_UI') this.resetToIdle(); }, 1000 + Math.random() * 800);

        } else if (roll < 0.70) {
            // Glance down toward the TAKE! button with curiosity
            this.state = 'LOOKING_UI';
            this.lookAt(-50, -18);
            this.setMouthState('curious');
            setTimeout(() => { if (this.state === 'LOOKING_UI') this.resetToIdle(); }, 1200 + Math.random() * 600);

        } else if (roll < 0.85) {
            // Subtle Ear Twitch
            this.twitchEar();

        } else {
            // Bored / Slow wandering gaze
            this.state = 'LOOKING_UI';
            this.lookAt(-38, -72);
            setTimeout(() => {
                this.lookAt(-62, -38);
                setTimeout(() => { if (this.state === 'LOOKING_UI') this.resetToIdle(); }, 800);
            }, 800);
        }
    },

    resetToIdle() {
        this.state = 'IDLE';
        this.overrideLook = false;
        if (this.shell) {
            this.shell.classList.remove('portal_capturing', 'take_anticipation', 'creature_excited');
        }
        this.resetLook();
    },

    // -----------------------------------------------------
    // 6. RARE EVENTS / EASTER EGGS
    // -----------------------------------------------------
    triggerRareEasterEgg() {
        const events = [
            'ONE_EYE_BLINK',
            'DOUBLE_BLINK',
            'DERP_DIVERGENT',
            'LOOK_OUTSIDE_PAGE',
            'STARING_CONTEST',
            'CORNER_GLANCE',
            'FROZEN_STILL',
            'TINY_STARTLE',
            'DELIBERATE_SNUB',
            'SHADOW_LAG'
        ];

        const choice = events[Math.floor(Math.random() * events.length)];
        this.state = 'RARE_EVENT';
        this.overrideLook = true;

        switch (choice) {
            case 'ONE_EYE_BLINK': {
                // Independent one-eye wink!
                const which = Math.random() < 0.5 ? 'left' : 'right';
                this.blink(false, which);
                setTimeout(() => this.resetToIdle(), 600);
                break;
            }

            case 'DOUBLE_BLINK': {
                this.blink(true);
                setTimeout(() => this.resetToIdle(), 500);
                break;
            }

            case 'DERP_DIVERGENT': {
                // Eyes look in opposite directions (wall-eyed derp!)
                this.lookAt(-85, -50, -15, -50);
                this.setMouthState('curious');
                setTimeout(() => {
                    this.blink();
                    this.resetToIdle();
                }, 850);
                break;
            }

            case 'LOOK_OUTSIDE_PAGE': {
                // Creature looks way up at the top edge, tracking something invisible
                this.lookAt(-50, -88);
                setTimeout(() => {
                    this.twitchEar();
                    setTimeout(() => this.resetToIdle(), 600);
                }, 1300);
                break;
            }

            case 'STARING_CONTEST': {
                // Locks dead center, unblinking for 4.2 seconds straight at user
                this.lookAt(-50, -50);
                this.setEyeExpression('wide');
                setTimeout(() => {
                    this.blink(true);
                    this.resetToIdle();
                }, 4200);
                break;
            }

            case 'CORNER_GLANCE': {
                // Sudden glance to upper corner
                const isLeft = Math.random() < 0.5;
                this.lookAt(isLeft ? -82 : -18, -82);
                this.twitchEar(isLeft ? 'left' : 'right');
                setTimeout(() => this.resetToIdle(), 1100);
                break;
            }

            case 'FROZEN_STILL': {
                // Creature completely freezes breath & movement
                if (this.shell) this.shell.classList.add('creature_frozen');
                setTimeout(() => {
                    if (this.shell) this.shell.classList.remove('creature_frozen');
                    this.blink();
                    this.resetToIdle();
                }, 2400);
                break;
            }

            case 'TINY_STARTLE': {
                // Quick startle for no obvious reason
                this.setEyeExpression('wide');
                this.twitchEar('left');
                this.lookAt(-40, -60);
                setTimeout(() => {
                    this.lookAt(-60, -40);
                    setTimeout(() => {
                        this.blink();
                        this.resetToIdle();
                    }, 400);
                }, 300);
                break;
            }

            case 'DELIBERATE_SNUB': {
                // Deliberately looks away and pouts
                this.lookAt(-18, -80);
                this.setEyeExpression('squint');
                this.setMouthState('pout');
                setTimeout(() => this.resetToIdle(), 1800);
                break;
            }

            case 'SHADOW_LAG': {
                // Shadow drifts independently; creature glances down at it in mild suspicion
                if (this.shell) this.shell.classList.add('shadow_lag');
                this.lookAt(-25, -20);
                this.setEyeExpression('squint');
                setTimeout(() => {
                    this.blink();
                    if (this.shell) this.shell.classList.remove('shadow_lag');
                    this.resetToIdle();
                }, 1300);
                break;
            }

            default:
                this.resetToIdle();
        }
    },

    // -----------------------------------------------------
    // 7. CURSOR ATTENTION & TERRITORY SYSTEM
    // -----------------------------------------------------
    setupEventListeners() {
        // Document Mouse Movement -> Attention tracking
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Territory awareness for UI panels
        this.setupTerritoryPanels();

        // Fourth-Wall Awareness: Tab visibility & window focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onTabInactive();
            } else {
                this.onTabActive();
            }
        });

        window.addEventListener('blur', () => {
            if (!this.isSleeping && this.state === 'IDLE') {
                // Drifts gaze down when window loses focus
                this.lookAt(-50, -70);
            }
        });

        window.addEventListener('focus', () => {
            if (!this.isSleeping) {
                this.lookAt(-50, -50);
            }
        });
    },

    handleMouseMove(e) {
        if (this.isSleeping || this.state === 'EATING' || this.state === 'COUNTDOWN' || this.state === 'REACTING_PHOTO') return;

        this.recordUserActivity();
        const now = Date.now();
        const dt = Math.max(1, now - this.lastMouseMoveTime);

        // Calculate cursor speed (px / ms)
        let speed = 0;
        if (this.lastMouseX !== null) {
            const dist = Math.hypot(e.clientX - this.lastMouseX, e.clientY - this.lastMouseY);
            speed = dist / dt;
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.lastMouseMoveTime = now;

        // Check if cursor is inside creature's territory (camera wrapper)
        const creatureRect = this.shell ? this.shell.getBoundingClientRect() : null;
        const inTerritory = creatureRect && (
            e.clientX >= creatureRect.left &&
            e.clientX <= creatureRect.right &&
            e.clientY >= creatureRect.top &&
            e.clientY <= creatureRect.bottom
        );
        this.cursorInTerritory = inTerritory;

        // A. JIGGLE HARASSMENT DETECTOR (Rapid erratic mouse movement over face)
        if (inTerritory && speed > 1.2) {
            this.jiggleHistory.push(now);
            this.jiggleHistory = this.jiggleHistory.filter(t => now - t < 1200);

            if (this.jiggleHistory.length > 7 && this.mood !== 'ANNOYED') {
                // Annoyed by cursor waving!
                this.setMood('ANNOYED');
                this.state = 'RARE_EVENT';
                this.overrideLook = true;
                this.lookAt(-15, -75);
                this.setEyeExpression('squint');
                this.setMouthState('pout');
                this.ignoreCursorUntil = now + 4200; // Ignore cursor for 4s

                setTimeout(() => {
                    this.jiggleHistory = [];
                    this.resetToIdle();
                }, 3000);
                return;
            }
        }

        // If currently snubbing / ignoring cursor:
        if (now < this.ignoreCursorUntil) return;
        if (this.overrideLook) return;

        // B. VERY FAST CURSOR: Creature tries to follow, gives up!
        if (speed > 2.8) {
            if (Math.random() < 0.45 && this.state !== 'ATTENTIVE') {
                this.overrideLook = true;
                this.lookAt(-35, -50);
                setTimeout(() => {
                    this.blink();
                    this.resetToIdle();
                    this.ignoreCursorUntil = Date.now() + 1800;
                }, 350);
                return;
            }
        }

        // C. ATTENTION DECISION (Creature does NOT obey cursor, it notices)
        if (this.state !== 'ATTENTIVE') {
            // Probability of noticing cursor
            let noticeProb = inTerritory ? 0.65 : 0.38;

            if (this.species === 'CURIOUS') noticeProb += 0.20;
            if (this.species === 'SLEEPY') noticeProb -= 0.30;
            if (this.species === 'SHY') noticeProb = inTerritory ? 0.20 : 0.45; // Shy avoids close cursor
            if (this.species === 'MISCHIEVOUS') noticeProb = 0.42;

            if (this.mood === 'BORED') noticeProb *= 0.5;
            if (this.mood === 'SLEEPY') noticeProb *= 0.3;
            if (this.mood === 'ANNOYED') noticeProb = 0.1;

            if (Math.random() > noticeProb) {
                // Decided to ignore!
                this.ignoreCursorUntil = now + 1500;
                return;
            }

            // Decide to notice! Organic delayed glance
            this.state = 'ATTENTIVE';
            const glanceDelay = 80 + Math.random() * 220; // 80-300ms reaction delay
            setTimeout(() => {
                if (this.state === 'ATTENTIVE') {
                    this.updateGazeTowardCursor(e.clientX, e.clientY);
                }
            }, glanceDelay);

        } else {
            // Already paying attention: update gaze smoothly
            this.updateGazeTowardCursor(e.clientX, e.clientY);
        }

        // D. INTEREST LOSS TIMER
        // After cursor stops or user does nothing, creature loses interest and looks back
        clearTimeout(this.attentionLossTimer);
        const attentionSpan = 1100 + Math.random() * 1100; // 1.1s - 2.2s of attention
        this.attentionLossTimer = setTimeout(() => {
            if (this.state === 'ATTENTIVE') {
                this.state = 'IDLE';
                this.resetLook();
                // Cool down before noticing cursor again
                this.ignoreCursorUntil = Date.now() + 1800 + Math.random() * 2200;
            }
        }, attentionSpan);
    },

    updateGazeTowardCursor(clientX, clientY) {
        if (this.species === 'SHY' && this.cursorInTerritory) {
            // Shy creature looks away when cursor is too close!
            this.lookAt(-20, -75);
            return;
        }

        const px = clientX / window.innerWidth;
        const py = clientY / window.innerHeight;

        // Natural soft-clamped pupil range
        const targetX = -78 + (px * 56);
        const targetY = -78 + (py * 56);
        this.lookAt(targetX, targetY);
    },

    setupTerritoryPanels() {
        // History Panel hover
        const historyPanel = document.querySelector('.history_panel');
        if (historyPanel) {
            historyPanel.addEventListener('mouseenter', () => {
                if (this.isSleeping || this.state === 'EATING' || this.state === 'COUNTDOWN' || this.state === 'REACTING_PHOTO') return;
                this.recordUserActivity();

                // 65% chance creature notices activity toward History
                if (Math.random() < 0.65 && this.mood !== 'ANNOYED') {
                    this.overrideLook = true;
                    this.state = 'LOOKING_UI';
                    const delay = 60 + Math.random() * 180;
                    setTimeout(() => {
                        if (this.state === 'LOOKING_UI') {
                            this.lookAt(-85, -50);
                        }
                    }, delay);
                }
            });
            historyPanel.addEventListener('mouseleave', () => {
                if (this.state === 'LOOKING_UI') {
                    setTimeout(() => this.resetToIdle(), 250);
                }
            });
        }

        // Filters Panel hover
        const filtersPanel = document.querySelector('.filters_panel');
        if (filtersPanel) {
            filtersPanel.addEventListener('mouseenter', () => {
                if (this.isSleeping || this.state === 'EATING' || this.state === 'COUNTDOWN' || this.state === 'REACTING_PHOTO') return;
                this.recordUserActivity();

                // 65% chance creature notices activity toward Filters
                if (Math.random() < 0.65 && this.mood !== 'ANNOYED') {
                    this.overrideLook = true;
                    this.state = 'LOOKING_UI';
                    const delay = 60 + Math.random() * 180;
                    setTimeout(() => {
                        if (this.state === 'LOOKING_UI') {
                            this.lookAt(-15, -50);
                        }
                    }, delay);
                }
            });
            filtersPanel.addEventListener('mouseleave', () => {
                if (this.state === 'LOOKING_UI') {
                    setTimeout(() => this.resetToIdle(), 250);
                }
            });
        }

        // TAKE! Button hover
        const takeBtn = document.getElementById('take_photo_btn');
        if (takeBtn) {
            takeBtn.addEventListener('mouseenter', () => {
                if (this.isSleeping || this.state === 'EATING' || this.state === 'COUNTDOWN' || this.state === 'REACTING_PHOTO') return;
                this.recordUserActivity();
                if (this.shell) this.shell.classList.add('take_anticipation');

                // 75% chance creature looks down eagerly at the TAKE button!
                if (Math.random() < 0.75 && this.mood !== 'ANNOYED') {
                    this.overrideLook = true;
                    this.state = 'LOOKING_UI';
                    this.lookAt(-50, -14);
                    this.setMouthState('curious');
                }
            });
            takeBtn.addEventListener('mouseleave', () => {
                if (this.shell && this.state !== 'COUNTDOWN' && this.state !== 'EXCITED') {
                    this.shell.classList.remove('take_anticipation');
                }
                if (this.state === 'LOOKING_UI') {
                    setTimeout(() => this.resetToIdle(), 250);
                }
            });
        }
    },

    // -----------------------------------------------------
    // 8. FOURTH-WALL SLEEP / WAKE SYSTEM & ZZZ SNORE
    // -----------------------------------------------------
    goToSleep() {
        if (this.isSleeping) return;
        this.isSleeping = true;
        this.state = 'SLEEPING';
        this.sleepStartTime = Date.now();
        this.setEyeExpression('closed');
        this.setMouthState('sleep');
        this.lookAt(-50, -50);
        this.startSleepZCycle();
    },

    wakeUp() {
        if (!this.isSleeping) return;
        const sleptDuration = Date.now() - this.sleepStartTime;
        this.isSleeping = false;
        this.stopSleepZCycle();
        this.lastUserActivity = Date.now();

        // Slow awakening progression
        this.overrideLook = true;
        this.setEyeExpression('sleepy');
        this.setMouthState('normal');

        setTimeout(() => {
            this.setEyeExpression('wide');
            this.lookAt(-50, -50);

            setTimeout(() => {
                this.setEyeExpression('normal');
                this.blink(sleptDuration > 20000);
                if (sleptDuration > 20000) {
                    this.twitchEar();
                }
                this.setMood('CALM');
                this.resetToIdle();
            }, 350);
        }, 450);
    },

    onTabInactive() {
        this.goToSleep();
    },

    onTabActive() {
        this.wakeUp();
    },

    startSleepZCycle() {
        this.stopSleepZCycle();
        // Initial soft delay before first Z appears
        this.sleepZTimer = setTimeout(() => {
            this.spawnZBurst();
        }, 700);
    },

    spawnZBurst() {
        if (!this.isSleeping) return;

        const container = document.getElementById('creature_zzz_container');
        if (!container) return;

        // 2 to 3 Zs per burst (as requested: "chỉ xuất hiện 2-3 chữ Z ko spam")
        const count = Math.random() < 0.5 ? 2 : 3;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!this.isSleeping) return;

                const zEl = document.createElement('span');
                zEl.className = 'sleep_z';
                zEl.textContent = 'Z';

                // Size grows progressively (13px, 17px, 21px)
                zEl.style.fontSize = `${13 + i * 4}px`;

                // Organic curving trajectory (no straight line!)
                // Random side bias with alternating sway
                const bias = Math.random() < 0.5 ? 1 : -1;
                const d1 = bias * (6 + Math.random() * 8);       // Initial drift
                const d2 = -bias * (6 + Math.random() * 14);     // Curves back opposite side
                const d3 = bias * (14 + Math.random() * 18);     // Sweeps up and away
                const r1 = (Math.random() - 0.5) * 22;
                const r2 = (Math.random() - 0.5) * 28;
                const r3 = (Math.random() - 0.5) * 34;

                zEl.style.setProperty('--z-drift-1', `${d1}px`);
                zEl.style.setProperty('--z-drift-2', `${d2}px`);
                zEl.style.setProperty('--z-drift-3', `${d3}px`);
                zEl.style.setProperty('--z-rot-1', `${r1}deg`);
                zEl.style.setProperty('--z-rot-2', `${r2}deg`);
                zEl.style.setProperty('--z-rot-3', `${r3}deg`);

                container.appendChild(zEl);

                setTimeout(() => {
                    if (zEl.parentNode) zEl.parentNode.removeChild(zEl);
                }, 2500);
            }, i * 480);
        }

        // Random interval between 2s and 4s (2000ms - 4000ms) before the next Z burst
        const nextDelay = 2000 + Math.random() * 2000 + (count * 480);
        this.sleepZTimer = setTimeout(() => {
            this.spawnZBurst();
        }, nextDelay);
    },

    stopSleepZCycle() {
        clearTimeout(this.sleepZTimer);
        this.sleepZTimer = null;
        const container = document.getElementById('creature_zzz_container');
        if (container) container.innerHTML = '';
    },

    // -----------------------------------------------------
    // 9. FILTER CHANGE REACTIONS
    // -----------------------------------------------------
    onFilterChange(preset, rawFilter) {
        if (this.shell) {
            const hasFilter = (preset && preset !== 'none') || (rawFilter && rawFilter !== 'none');
            if (hasFilter) {
                this.shell.classList.add('filter_active');
            } else {
                this.shell.classList.remove('filter_active');
            }
        }
        if (this.isSleeping) return;
        this.recordUserActivity();
        this.overrideLook = true;
        this.state = 'RARE_EVENT';

        switch (preset) {
            case 'none': // Normal
                this.blink();
                this.resetLook();
                this.setMood('CALM');
                setTimeout(() => this.resetToIdle(), 450);
                break;

            case 'vintage': // Looks down at the sepia camera view
                this.lookAt(-65, -30);
                this.setMouthState('curious');
                setTimeout(() => {
                    this.blink();
                    this.resetToIdle();
                }, 1300);
                break;

            case 'lomo': // Surprised by vivid punch!
                this.setEyeExpression('wide');
                this.setMouthState('open');
                this.twitchEar('right');
                this.setMood('EXCITED');
                setTimeout(() => {
                    this.blink();
                    this.resetToIdle();
                }, 1100);
                break;

            case 'clarity': // Sharp visual adjustment
                this.blink(true);
                this.setEyeExpression('wide');
                this.lookAt(-50, -50);
                setTimeout(() => this.resetToIdle(), 900);
                break;

            case 'sinCity': // Dramatic film noir squint
                this.setEyeExpression('squint');
                this.setMouthState('pout');
                this.lookAt(-75, -50);
                setTimeout(() => {
                    this.lookAt(-25, -50);
                    setTimeout(() => {
                        this.lookAt(-50, -50);
                        this.resetToIdle();
                    }, 600);
                }, 600);
                break;

            case 'crossProcess': // Confused by psychedelic shifts
                this.setMood('CONFUSED');
                this.lookAt(-75, -50);
                this.twitchEar('left');
                setTimeout(() => {
                    this.lookAt(-25, -50);
                    setTimeout(() => {
                        this.lookAt(-50, -50);
                        this.blink();
                        this.resetToIdle();
                    }, 500);
                }, 500);
                break;

            case 'sunrise': // Basking upward
                this.setEyeExpression('wide');
                this.lookAt(-50, -75);
                setTimeout(() => this.resetToIdle(), 1200);
                break;

            case 'herMajesty': // Regal calm
                this.lookAt(-50, -60);
                this.setMouthState('pleased');
                setTimeout(() => this.resetToIdle(), 1200);
                break;

            case 'nostalgia': // Soft wandering gaze
                this.lookAt(-38, -65);
                setTimeout(() => {
                    this.blink();
                    this.resetToIdle();
                }, 1100);
                break;

            case 'pinhole': // Focused pinhole stare
                this.lookAt(-50, -50);
                this.twitchEar();
                setTimeout(() => this.resetToIdle(), 900);
                break;

            default:
                this.blink();
                setTimeout(() => this.resetToIdle(), 500);
        }
    },

    // -----------------------------------------------------
    // 10. PHOTO SEQUENCE & CONNECTION TO HISTORY
    // -----------------------------------------------------
    onTakeInitiated() {
        this.recordUserActivity();
        this.overrideLook = true;
        this.state = 'EXCITED';
        this.setMood('EXCITED');
        this.lookAt(-50, -15);
        this.setMouthState('open');
        this.setEyeExpression('wide');
        if (this.shell) {
            this.shell.classList.add('creature_excited', 'portal_capturing', 'take_anticipation');
        }
    },

    onCountdown(remainingSeconds) {
        this.overrideLook = true;
        this.state = 'COUNTDOWN';
        this.lookAt(-50, -45); // Focuses on the center countdown
        this.setEyeExpression('wide');
        this.setMouthState('open');

        if (this.shell) {
            this.shell.classList.remove('creature_excited');
            this.shell.classList.add('portal_capturing', 'take_anticipation');
            if (remainingSeconds % 2 === 0) {
                this.twitchEar('left');
            } else {
                this.twitchEar('right');
            }
        }
    },

    onFlash() {
        this.state = 'FLASH_WINCE';
        this.setEyeExpression('wince');
        if (this.shell) {
            this.shell.classList.add('creature_recoil');
            setTimeout(() => {
                if (this.shell) this.shell.classList.remove('creature_recoil');
            }, 300);
        }
    },

    eatPhoto(imgDataUrl) {
        return new Promise((resolve) => {
            const swallowEl = document.getElementById('flying_photo_swallow');
            if (!swallowEl) {
                resolve();
                return;
            }

            this.state = 'EATING';
            this.overrideLook = true;

            swallowEl.style.backgroundImage = `url(${imgDataUrl})`;
            swallowEl.classList.remove('swallowing');
            void swallowEl.offsetWidth; // force reflow

            this.setMouthState('eating');
            this.setEyeExpression('wide');
            this.lookAt(-50, -50);

            swallowEl.classList.add('swallowing');

            setTimeout(() => {
                this.setEyeExpression('blink');
                if (this.shell) {
                    this.shell.classList.add('creature_recoil');
                    setTimeout(() => {
                        if (this.shell) this.shell.classList.remove('creature_recoil');
                        this.setEyeExpression('normal');
                        this.setMouthState('normal');
                    }, 280);
                }
            }, 440);

            setTimeout(() => {
                swallowEl.classList.remove('swallowing');
                swallowEl.style.backgroundImage = 'none';
                if (this.shell) {
                    this.shell.classList.remove('portal_capturing', 'take_anticipation', 'creature_excited');
                }
                this.state = 'IDLE';
                this.overrideLook = false;
                resolve();
            }, 720);
        });
    },

    onPhotoAppearedInHistory() {
        // MAJOR INTERACTION: Creature notices the newly taken photo appeared in History!
        const now = Date.now();
        this.recentPhotoTimes.push(now);
        this.recentPhotoTimes = this.recentPhotoTimes.filter(t => now - t < 40000);

        this.overrideLook = true;
        this.state = 'REACTING_PHOTO';

        // Check if user took many photos rapidly (>= 3 photos in 40s) -> creature gets overwhelmed / sleepy
        if (this.recentPhotoTimes.length >= 3) {
            this.setMood('SLEEPY');
            this.setEyeExpression('sleepy');
            this.lookAt(-50, -50);
            setTimeout(() => {
                this.blink(true);
                this.resetToIdle();
            }, 2500);
            return;
        }

        // Normal photo appreciation sequence:
        // look at user -> look left toward History -> look back at user (or double glance)
        this.lookAt(-50, -50);

        setTimeout(() => {
            // Turns to look directly at the History panel on the left
            this.lookAt(-85, -50);
            this.setMouthState('pleased');

            setTimeout(() => {
                const doubleGlance = Math.random() < 0.40;

                if (doubleGlance) {
                    // Double take: looks at user, then back at History!
                    this.lookAt(-50, -50);
                    setTimeout(() => {
                        this.lookAt(-85, -50);
                        setTimeout(() => {
                            this.lookAt(-50, -50);
                            this.setMood('CALM');
                            this.resetToIdle();
                        }, 600);
                    }, 350);
                } else {
                    // Looks back at user with satisfaction
                    this.lookAt(-50, -50);
                    this.setMood('CALM');
                    setTimeout(() => this.resetToIdle(), 600);
                }
            }, 850);
        }, 300);
    },

    // -----------------------------------------------------
    // 11. CONTEXTUAL ACCESSORIES & UNIFIED UI REACTIONS
    // -----------------------------------------------------
    setTimerActive(isActive) {
        if (!this.shell) return;
        if (isActive) {
            this.shell.classList.add('timer_active');
        } else {
            this.shell.classList.remove('timer_active');
        }
    },

    onCameraSwitch() {
        if (this.isSleeping) return;
        this.recordUserActivity();
        this.blink(true);
        this.twitchEar('right');
        this.setEyeExpression('wide');
        this.lookAt(-50, -50);
        setTimeout(() => {
            this.resetToIdle();
        }, 700);
    },

    onMirrorToggle(isMirrored) {
        if (this.isSleeping) return;
        this.recordUserActivity();
        this.twitchEar(isMirrored ? 'left' : 'right');
        this.lookAt(isMirrored ? -70 : -30, -50);
        setTimeout(() => {
            this.lookAt(isMirrored ? -30 : -70, -50);
            setTimeout(() => this.resetToIdle(), 400);
        }, 300);
    },

    onThemeChange(themeName) {
        if (this.isSleeping) return;
        this.recordUserActivity();
        this.overrideLook = true;
        this.lookAt(-50, -20);
        this.setMouthState('curious');
        setTimeout(() => {
            this.blink();
            this.resetToIdle();
        }, 750);
    },

    onMemoryHover() {
        if (this.isSleeping || this.state === 'EATING' || this.state === 'COUNTDOWN' || this.state === 'REACTING_PHOTO') return;
        this.recordUserActivity();
        this.overrideLook = true;
        this.state = 'MEMORY_RECALL';
        this.lookAt(-85, -50);
        this.setMouthState('pleased');
    },

    onMemoryLeave() {
        if (this.state === 'MEMORY_RECALL') {
            setTimeout(() => {
                if (this.state === 'MEMORY_RECALL') {
                    this.resetToIdle();
                }
            }, 250);
        }
    }
};

window.Creature = Creature;

// Initialize Creature Mascot once DOM is fully prepared
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Creature.init());
} else {
    setTimeout(() => Creature.init(), 100);
}
