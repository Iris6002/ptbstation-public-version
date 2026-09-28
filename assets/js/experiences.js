// =========================================================
// PHOTOBOOTH STATION - 3 BIG INTERACTIVE EXPERIENCES
// 1. The Grand Sneeze (Seismic Booth Collapse & Magnetic Rewind)
// 2. The Cursor Ambush (Fourth-Wall Rubber-Band Snatch & Spit)
// 3. The Darkroom Eclipse & Neon Light-Painting Studio
// =========================================================

const PTBExperiences = {
    // State Flags
    sneezeBoopCount: 0,
    sneezeBoopTimer: null,
    isSneezing: false,

    ambushActive: false,
    ambushHoverTimer: null,
    ambushMouthHovering: false,
    ambushPointerX: 0,
    ambushPointerY: 0,
    ambushArmSvg: null,
    ambushStartTime: 0,
    ambushAnimId: null,

    darkroomActive: false,
    lightCanvas: null,
    lightCtx: null,
    lightColor: '#ff2d75',
    lightColors: ['#ff2d75', '#00f5ff', '#ffe600', '#00ff88', '#ffffff'],
    lightColorIndex: 0,
    isPaintingLight: false,
    hasPaintedSomething: false,
    lastLightX: 0,
    lastLightY: 0,

    init() {
        this.initGrandSneeze();
        this.initCursorAmbush();
        this.initDarkroomEclipse();
    },

    // =========================================================
    // EXPERIENCE 1: THE GRAND SNEEZE
    // Trigger: 5 rapid boops on the creature's + patch within 1.6s
    // Action: Inhale windup -> Shockwave Sneeze -> All DOM panels collapse
    //         and tilt off-axis -> Mortified panic -> Magnetic snap rewind!
    // =========================================================
    initGrandSneeze() {
        const patch = document.querySelector('.creature_patch');
        if (!patch) return;

        patch.addEventListener('click', () => {
            if (this.isSneezing) return;

            this.sneezeBoopCount++;
            clearTimeout(this.sneezeBoopTimer);

            if (this.sneezeBoopCount >= 5) {
                this.sneezeBoopCount = 0;
                this.triggerGrandSneeze();
            } else {
                this.sneezeBoopTimer = setTimeout(() => {
                    this.sneezeBoopCount = 0;
                }, 1600);
            }
        });
    },

    triggerGrandSneeze() {
        this.isSneezing = true;
        const shell = document.querySelector('.creature_shell');
        const layout = document.querySelector('.app_layout');
        const creature = window.Creature;
        const world = window.PTBWorld;

        if (world && world.play) {
            world.play('sneeze_inhale');
        }

        // 1. INHALE WINDUP: Creature swells up, heaves chest with 3 tremors
        if (creature) {
            creature.overrideLook = true;
            creature.setEyeExpression('wince');
            creature.setMouthState('open');
        }
        if (shell) {
            shell.classList.add('creature_sneeze_swell');
        }

        // 2. THE SNEEZE BLAST (at 1.25s)
        setTimeout(() => {
            if (world && world.play) {
                world.play('sneeze_blast');
            }

            // Screen flash & shockwave ring
            if (shell) shell.classList.remove('creature_sneeze_swell');
            this.spawnSneezeShockwave();

            // White flash overlay
            const flash = document.createElement('div');
            flash.className = 'sneeze_flash_curtain';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 180);

            // DOM SEISMIC COLLAPSE: All panels tilt and drop!
            const header = document.querySelector('.top_header');
            const controlBar = document.querySelector('.top_controls_row');
            const memories = document.getElementById('history_panel');
            const filters = document.getElementById('filters_panel');
            const takeBtn = document.querySelector('.takephoto_btn');

            if (header) header.classList.add('sneeze_shatter_header');
            if (controlBar) controlBar.classList.add('sneeze_shatter_controls');
            if (memories) memories.classList.add('sneeze_shatter_memories');
            if (filters) filters.classList.add('sneeze_shatter_filters');
            if (takeBtn) takeBtn.classList.add('sneeze_shatter_take');
            if (layout) layout.classList.add('booth_seismic_havoc');

            // Creature reacts with extreme mortification / panic
            if (creature) {
                creature.setEyeExpression('wide');
                creature.setMouthState('open');
                if (creature.shell) {
                    creature.shell.classList.add('creature_mortified');
                }
            }

            // Scatter cartoon comic exclamation and dust puffs
            this.spawnComicSparks();

            // 3. RECOVERY & MAGNETIC REWIND (at 2.8s after shock)
            setTimeout(() => {
                if (world && world.play) {
                    world.play('rewind_clack');
                }

                // Add magnetic snap class
                [header, controlBar, memories, filters, takeBtn].forEach(el => {
                    if (el) {
                        el.classList.add('magnetic_snap_rewind');
                    }
                });

                // Remove shatter transforms
                setTimeout(() => {
                    if (header) header.className = header.className.replace(/sneeze_shatter_\w+/g, '').replace('magnetic_snap_rewind', '');
                    if (controlBar) controlBar.className = controlBar.className.replace(/sneeze_shatter_\w+/g, '').replace('magnetic_snap_rewind', '');
                    if (memories) memories.className = memories.className.replace(/sneeze_shatter_\w+/g, '').replace('magnetic_snap_rewind', '');
                    if (filters) filters.className = filters.className.replace(/sneeze_shatter_\w+/g, '').replace('magnetic_snap_rewind', '');
                    if (takeBtn) takeBtn.className = takeBtn.className.replace(/sneeze_shatter_\w+/g, '').replace('magnetic_snap_rewind', '');
                    if (layout) layout.classList.remove('booth_seismic_havoc');

                    if (creature) {
                        if (creature.shell) creature.shell.classList.remove('creature_mortified');
                        creature.setMouthState('pleased');
                        creature.blink(true, 'right'); // guilty wink
                        setTimeout(() => {
                            creature.resetToIdle();
                            this.isSneezing = false;
                        }, 1200);
                    } else {
                        this.isSneezing = false;
                    }
                }, 450);

            }, 2700);

        }, 1250);
    },

    spawnSneezeShockwave() {
        const shell = document.querySelector('.creature_shell');
        if (!shell) return;
        const rect = shell.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.4;

        const wave = document.createElement('div');
        wave.className = 'sneeze_shockwave_ring';
        wave.style.left = `${cx}px`;
        wave.style.top = `${cy}px`;
        document.body.appendChild(wave);
        setTimeout(() => wave.remove(), 750);
    },

    spawnComicSparks() {
        const icons = ['💨', '💥', '⚡', '💨', '💦'];
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('span');
            spark.className = 'comic_sneeze_particle';
            spark.textContent = icons[i % icons.length];
            spark.style.left = `${window.innerWidth * (0.25 + Math.random() * 0.5)}px`;
            spark.style.top = `${window.innerHeight * (0.2 + Math.random() * 0.5)}px`;
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 1100);
        }
    },


    // =========================================================
    // EXPERIENCE 2: THE CURSOR AMBUSH
    // Trigger: Hovering pointer right in front of creature's mouth for 2.2s
    // Action: Oversized stretchy cartoon arms surge out, grabbing the pointer!
    //         User engages in elastic rubber-band tug-of-war -> Creature chomps
    //         cursor, realizes it's plastic -> comedic raspberry spit & kick!
    // =========================================================
    initCursorAmbush() {
        const mouth = document.querySelector('.creature_face_center');
        if (!mouth) return;

        window.addEventListener('mousemove', (e) => {
            this.ambushPointerX = e.clientX;
            this.ambushPointerY = e.clientY;

            if (this.ambushActive) {
                this.updateAmbushTug(e.clientX, e.clientY);
                return;
            }

            if (this.isSneezing || (window.Creature && window.Creature.isSleeping)) return;

            // Check distance to creature mouth
            const mRect = mouth.getBoundingClientRect();
            const mx = mRect.left + mRect.width / 2;
            const my = mRect.top + mRect.height / 2;
            const dist = Math.hypot(e.clientX - mx, e.clientY - my);

            if (dist < 48) {
                if (!this.ambushMouthHovering) {
                    this.ambushMouthHovering = true;
                    // Creature eyes dilate wide in hungry anticipation
                    if (window.Creature) {
                        window.Creature.setEyeExpression('wide');
                        window.Creature.setMouthState('open');
                    }
                    this.ambushHoverTimer = setTimeout(() => {
                        this.triggerCursorAmbush(mx, my);
                    }, 2100);
                }
            } else {
                if (this.ambushMouthHovering) {
                    this.ambushMouthHovering = false;
                    clearTimeout(this.ambushHoverTimer);
                    if (window.Creature && !this.ambushActive) {
                        window.Creature.resetToIdle();
                    }
                }
            }
        });
    },

    triggerCursorAmbush(mouthX, mouthY) {
        if (this.ambushActive) return;
        this.ambushActive = true;
        const world = window.PTBWorld;

        if (world && world.play) {
            world.play('whip_snatch');
        }

        // Create overlay canvas / SVG for stretchy cartoon arms
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'ambush_arms_layer');
        svg.innerHTML = `
            <defs>
                <filter id="neo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="4" dy="4" stdDeviation="0" flood-color="#121212" />
                </filter>
            </defs>
            <path id="ambush_arm_left" fill="none" stroke="#121212" stroke-width="18" stroke-linecap="round" />
            <path id="ambush_arm_left_fill" fill="none" stroke="#f6eccd" stroke-width="12" stroke-linecap="round" />
            <path id="ambush_arm_right" fill="none" stroke="#121212" stroke-width="18" stroke-linecap="round" />
            <path id="ambush_arm_right_fill" fill="none" stroke="#f6eccd" stroke-width="12" stroke-linecap="round" />
            <g id="ambush_claws">
                <circle id="claw_paw_left" r="22" fill="#f6eccd" stroke="#121212" stroke-width="3.5" filter="url(#neo-shadow)" />
                <circle id="claw_paw_right" r="22" fill="#f6eccd" stroke="#121212" stroke-width="3.5" filter="url(#neo-shadow)" />
            </g>
        `;
        document.body.appendChild(svg);
        this.ambushArmSvg = svg;

        // Add trapped cursor icon on pointer
        const trapIndicator = document.createElement('div');
        trapIndicator.className = 'ambush_cursor_trap';
        trapIndicator.innerHTML = '<span>🐾 OUCH!</span>';
        document.body.appendChild(trapIndicator);
        this.ambushTrapEl = trapIndicator;

        this.ambushStartTime = Date.now();
        this.ambushOriginX = mouthX;
        this.ambushOriginY = mouthY;

        // Animation frame loop for dynamic stretchy arm tension
        const renderLoop = () => {
            if (!this.ambushActive) return;
            this.renderAmbushArms(this.ambushPointerX, this.ambushPointerY);
            this.ambushAnimId = requestAnimationFrame(renderLoop);
        };
        this.ambushAnimId = requestAnimationFrame(renderLoop);

        // Tug-of-war duration: 2.6 seconds
        setTimeout(() => {
            this.resolveCursorAmbush();
        }, 2600);
    },

    updateAmbushTug(px, py) {
        if (!this.ambushActive) return;
        const dx = px - this.ambushOriginX;
        const dy = py - this.ambushOriginY;
        const dist = Math.hypot(dx, dy);

        // Dynamic rubber-band sound based on stretch tension
        if (window.PTBWorld && window.PTBWorld.play && Math.random() < 0.22) {
            const freq = Math.min(850, 180 + dist * 2.2);
            window.PTBWorld.play('rubber_stretch', freq);
        }

        // Creature shell leans towards the dragged cursor with spring resistance
        const shell = document.querySelector('.creature_shell');
        if (shell) {
            const leanX = Math.max(-20, Math.min(20, dx * 0.12));
            const leanY = Math.max(-15, Math.min(15, dy * 0.12));
            shell.style.transform = `translate(${leanX}px, ${leanY}px)`;
        }
    },

    renderAmbushArms(targetX, targetY) {
        if (!this.ambushArmSvg) return;
        const ox = this.ambushOriginX;
        const oy = this.ambushOriginY;

        const armL = this.ambushArmSvg.querySelector('#ambush_arm_left');
        const armLF = this.ambushArmSvg.querySelector('#ambush_arm_left_fill');
        const armR = this.ambushArmSvg.querySelector('#ambush_arm_right');
        const armRF = this.ambushArmSvg.querySelector('#ambush_arm_right_fill');
        const pawL = this.ambushArmSvg.querySelector('#claw_paw_left');
        const pawR = this.ambushArmSvg.querySelector('#claw_paw_right');

        // Dynamic bezier curve for stretchy cartoon arms
        const dL = `M ${ox - 24} ${oy + 10} Q ${ox - 60} ${(oy + targetY) / 2 + 30} ${targetX - 12} ${targetY}`;
        const dR = `M ${ox + 24} ${oy + 10} Q ${ox + 60} ${(oy + targetY) / 2 + 30} ${targetX + 12} ${targetY}`;

        if (armL) armL.setAttribute('d', dL);
        if (armLF) armLF.setAttribute('d', dL);
        if (armR) armR.setAttribute('d', dR);
        if (armRF) armRF.setAttribute('d', dR);

        if (pawL) {
            pawL.setAttribute('cx', targetX - 12);
            pawL.setAttribute('cy', targetY);
        }
        if (pawR) {
            pawR.setAttribute('cx', targetX + 12);
            pawR.setAttribute('cy', targetY);
        }

        if (this.ambushTrapEl) {
            this.ambushTrapEl.style.transform = `translate(${targetX}px, ${targetY - 32}px)`;
        }
    },

    resolveCursorAmbush() {
        const world = window.PTBWorld;
        const creature = window.Creature;
        const shell = document.querySelector('.creature_shell');

        // 1. Chomp down!
        if (world && world.play) {
            world.play('chomp');
        }

        // Clean up SVG arms
        cancelAnimationFrame(this.ambushAnimId);
        if (this.ambushArmSvg) {
            this.ambushArmSvg.remove();
            this.ambushArmSvg = null;
        }
        if (this.ambushTrapEl) {
            this.ambushTrapEl.remove();
            this.ambushTrapEl = null;
        }
        if (shell) shell.style.transform = '';

        // 2. Pause of realization...
        if (creature) {
            creature.setEyeExpression('sleepy');
            creature.setMouthState('open');
        }

        setTimeout(() => {
            // 3. DISGUST & RASPBERRY SPIT (*PBTTTHHH!*)
            if (world && world.play) {
                world.play('raspberry');
            }

            if (creature) {
                creature.setEyeExpression('wince');
                creature.setMouthState('pout');
                if (creature.shell) {
                    creature.shell.classList.add('creature_disgusted_shake');
                }
            }

            // Spawn comic grossed out emote
            const emote = document.createElement('div');
            emote.className = 'ambush_spit_emote';
            emote.textContent = '🤢 YUCK! (Plastic 0/10)';
            emote.style.left = `${this.ambushOriginX}px`;
            emote.style.top = `${this.ambushOriginY - 50}px`;
            document.body.appendChild(emote);
            setTimeout(() => emote.remove(), 1600);

            // Speed lines spitting away
            this.spawnSpitSpeedLines(this.ambushOriginX, this.ambushOriginY);

            setTimeout(() => {
                if (creature) {
                    if (creature.shell) creature.shell.classList.remove('creature_disgusted_shake');
                    creature.resetToIdle();
                }
                this.ambushActive = false;
                this.ambushMouthHovering = false;
            }, 1400);

        }, 400);
    },

    spawnSpitSpeedLines(ox, oy) {
        for (let i = 0; i < 6; i++) {
            const line = document.createElement('div');
            line.className = 'spit_speed_line';
            line.style.left = `${ox}px`;
            line.style.top = `${oy}px`;
            const angle = 30 + (i * 20);
            line.style.transform = `rotate(${angle}deg) translate(0, -60px)`;
            document.body.appendChild(line);
            setTimeout(() => line.remove(), 600);
        }
    },


    // =========================================================
    // EXPERIENCE 3: THE DARKROOM ECLIPSE & NEON LIGHT-PAINTING
    // Trigger: Pulling the dangling tactile brass chain in the header
    // Action: Room lights shut into analog red-safelight eclipse with
    //         fluorescent transformer hum -> creature glows with neon UV lines ->
    //         cursor becomes a light wand painting glowing ribbons onto camera feed!
    //         Any photo taken embeds the real neon light-painting into the photo strip!
    // =========================================================
    initDarkroomEclipse() {
        // Create the retro brass pull-chain dangling from top header right cluster
        const targetContainer = document.getElementById('header_right_cluster') || document.querySelector('.top_header');
        if (!targetContainer) return;

        const chainContainer = document.createElement('div');
        chainContainer.className = 'darkroom_pull_chain';
        chainContainer.title = 'Pull for Darkroom Safelight Mode';
        chainContainer.innerHTML = `
            <div class="chain_mount"></div>
            <div class="chain_links">
                <span class="chain_ball"></span>
                <span class="chain_ball"></span>
                <span class="chain_ball"></span>
                <span class="chain_ball"></span>
                <span class="chain_ball"></span>
                <span class="chain_handle"></span>
            </div>
            <div class="chain_hint_tag">PULL ME</div>
        `;
        targetContainer.appendChild(chainContainer);

        // Click to pull chain
        chainContainer.addEventListener('click', () => {
            this.toggleDarkroomEclipse(chainContainer);
        });

        // Initialize Light-Painting Canvas over the camera viewfinder
        this.initLightPaintingCanvas();
    },

    toggleDarkroomEclipse(chainEl) {
        const world = window.PTBWorld;
        if (world && world.play) {
            world.play('chain_pull');
        }

        // Pull physics animation
        if (chainEl) {
            chainEl.classList.add('chain_snagged');
            setTimeout(() => chainEl.classList.remove('chain_snagged'), 300);
        }

        this.darkroomActive = !this.darkroomActive;
        const appLayout = document.querySelector('.app_layout');

        if (this.darkroomActive) {
            // ENTER DARKROOM MODE
            // 1. Stuttering fluorescent lamp ignition
            if (world && world.play) {
                world.play('flicker');
                setTimeout(() => world.play('flicker'), 80);
                setTimeout(() => world.play('ballast_hum'), 220);
            }

            document.body.classList.add('darkroom_active');
            if (appLayout) appLayout.classList.add('darkroom_mode');

            // Show light palette controls
            const palette = document.getElementById('darkroom_light_palette');
            if (palette) palette.classList.add('active');

            // Creature enters glowing UV mode
            const shell = document.querySelector('.creature_shell');
            if (shell) shell.classList.add('creature_neon_uv');

            if (window.Creature) {
                window.Creature.setEyeExpression('wide');
            }

        } else {
            // EXIT DARKROOM MODE
            if (world && world.play) {
                world.play('flicker');
                world.play('ballast_hum'); // stops hum
            }

            document.body.classList.remove('darkroom_active');
            if (appLayout) appLayout.classList.remove('darkroom_mode');

            const palette = document.getElementById('darkroom_light_palette');
            if (palette) palette.classList.remove('active');

            const shell = document.querySelector('.creature_shell');
            if (shell) shell.classList.remove('creature_neon_uv');

            if (window.Creature) {
                window.Creature.resetToIdle();
            }
        }
    },

    initLightPaintingCanvas() {
        const portal = document.getElementById('camera_portal') || document.querySelector('.video_frame') || document.querySelector('.camera_viewport');
        if (!portal) return;

        // Canvas overlay
        const canvas = document.createElement('canvas');
        canvas.id = 'darkroom_light_canvas';
        canvas.className = 'darkroom_light_canvas';
        portal.appendChild(canvas);

        this.lightCanvas = canvas;
        this.lightCtx = canvas.getContext('2d');

        const resize = () => {
            const rect = portal.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100);
            setTimeout(resize, 350);
        });
        setTimeout(resize, 300);

        // Light Palette & Tool Bar
        const palette = document.createElement('div');
        palette.id = 'darkroom_light_palette';
        palette.className = 'darkroom_light_palette';
        palette.innerHTML = `
            <div class="palette_title">⚡ LIGHT WAND</div>
            <div class="palette_swatches">
                <button type="button" class="light_swatch active" data-color="#ff2d75" style="--l-color: #ff2d75;"></button>
                <button type="button" class="light_swatch" data-color="#00f5ff" style="--l-color: #00f5ff;"></button>
                <button type="button" class="light_swatch" data-color="#ffe600" style="--l-color: #ffe600;"></button>
                <button type="button" class="light_swatch" data-color="#00ff88" style="--l-color: #00ff88;"></button>
                <button type="button" class="light_swatch" data-color="#ffffff" style="--l-color: #ffffff;"></button>
            </div>
            <button type="button" class="light_clear_btn" id="light_clear_btn" title="Clear Canvas">CLEAR</button>
        `;
        portal.appendChild(palette);

        // Swatch clicks
        palette.querySelectorAll('.light_swatch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                palette.querySelectorAll('.light_swatch').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.lightColor = btn.getAttribute('data-color');
                if (window.PTBWorld && window.PTBWorld.play) {
                    window.PTBWorld.play('click', 800);
                }
            });
        });

        // Clear button
        const clearBtn = palette.querySelector('#light_clear_btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearLightPainting();
                if (window.PTBWorld && window.PTBWorld.play) {
                    window.PTBWorld.play('click', 440);
                }
            });
        }

        // Pointer event painting
        const getCanvasCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        canvas.addEventListener('pointerdown', (e) => {
            if (!this.darkroomActive) return;
            this.isPaintingLight = true;
            this.hasPaintedSomething = true;
            canvas.setPointerCapture(e.pointerId);
            const pos = getCanvasCoords(e);
            this.lastLightX = pos.x;
            this.lastLightY = pos.y;
            this.paintGlowPoint(pos.x, pos.y);
        });

        canvas.addEventListener('pointermove', (e) => {
            if (!this.darkroomActive || !this.isPaintingLight) return;
            const pos = getCanvasCoords(e);
            this.paintGlowLine(this.lastLightX, this.lastLightY, pos.x, pos.y);
            this.lastLightX = pos.x;
            this.lastLightY = pos.y;

            // Occasional soft audio spark
            if (window.PTBWorld && window.PTBWorld.play && Math.random() < 0.15) {
                window.PTBWorld.play('light_spark');
            }
        });

        const stopPainting = (e) => {
            this.isPaintingLight = false;
            try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
        };
        canvas.addEventListener('pointerup', stopPainting);
        canvas.addEventListener('pointercancel', stopPainting);
    },

    paintGlowPoint(x, y) {
        if (!this.lightCtx) return;
        const ctx = this.lightCtx;
        ctx.save();
        ctx.shadowColor = this.lightColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    paintGlowLine(x1, y1, x2, y2) {
        if (!this.lightCtx) return;
        const ctx = this.lightCtx;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer Neon Glow
        ctx.shadowColor = this.lightColor;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = this.lightColor;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Hot white core
        ctx.shadowBlur = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.restore();
    },

    clearLightPainting() {
        if (!this.lightCtx || !this.lightCanvas) return;
        this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        this.hasPaintedSomething = false;
    },

    hasLightPainting() {
        return this.darkroomActive && this.hasPaintedSomething;
    },

    drawLightPainting(targetCtx, destWidth, destHeight) {
        if (!this.lightCanvas || !this.hasPaintedSomething) return;
        targetCtx.save();
        targetCtx.drawImage(this.lightCanvas, 0, 0, destWidth, destHeight);
        targetCtx.restore();
    }
};

window.PTBExperiences = PTBExperiences;

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PTBExperiences.init());
} else {
    setTimeout(() => PTBExperiences.init(), 200);
}
