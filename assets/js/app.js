// =========================================================
// PHOTOBOOTH STATION - APP LOGIC
// =========================================================

// State
const state = {
    mode: 'single',             // 'single' | 'strip'
    timer: 3,                   // 0 | 3 | 5
    isMirrored: true,
    dateStamp: true,
    currentFilter: 'none',
    currentCamanPreset: 'none',
    frameColor: '#111111',
    isCapturing: false,
    activeStream: null,
    videoDevices: [],
    currentDeviceIndex: 0,
    currentResultDataUrl: null
};

window.state = state;


// =========================================================
// CAMERA INITIALIZATION & MANAGEMENT
// =========================================================

const videoElement = document.querySelector('.camera_stream');
const cameraSwitchBtn = document.getElementById('camera_switch_btn');

let currentFacingMode = 'user';

async function getCameraDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        state.videoDevices = devices.filter(d => d.kind === 'videoinput');
        if (cameraSwitchBtn) {
            cameraSwitchBtn.style.display = 'inline-flex';
        }
    } catch (err) {
        console.warn('Could not enumerate devices:', err);
    }
}

async function startCamera(deviceId = null, facingMode = null) {
    if (state.activeStream) {
        state.activeStream.getTracks().forEach(track => track.stop());
    }

    const videoConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: { ideal: 16 / 9 }
    };

    if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
    } else {
        videoConstraints.facingMode = facingMode || currentFacingMode;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: videoConstraints
        });

        state.activeStream = stream;
        videoElement.srcObject = stream;

        videoElement.onloadedmetadata = () => {
            videoElement.play();
        };

        await getCameraDevices();

    } catch (err) {
        console.error('Camera access failed:', err);
        if (facingMode === 'environment') {
            // Fallback to user camera if environment camera is not available
            currentFacingMode = 'user';
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: { width: { ideal: 1920 }, height: { ideal: 1080 }, aspectRatio: { ideal: 16 / 9 }, facingMode: 'user' }
                });
                state.activeStream = stream;
                videoElement.srcObject = stream;
                videoElement.onloadedmetadata = () => videoElement.play();
                return;
            } catch (fallbackErr) {
                console.error('Fallback camera failed:', fallbackErr);
            }
        }
        alert('Unable to access your camera. Please allow camera permissions in your browser settings.');
    }
}

// Start camera on page load
startCamera();


// =========================================================
// TOP TOOLBAR ACTIONS (MIRROR, CAM SWITCH)
// =========================================================

const mirrorToggleBtn = document.getElementById('mirror_toggle_btn');

mirrorToggleBtn.addEventListener('click', () => {
    state.isMirrored = !state.isMirrored;
    const label = mirrorToggleBtn.querySelector('.btn_label');

    if (state.isMirrored) {
        videoElement.classList.remove('unmirrored');
        label.textContent = 'Mirrored';
        mirrorToggleBtn.classList.remove('active');
    } else {
        videoElement.classList.add('unmirrored');
        label.textContent = 'Normal View';
        mirrorToggleBtn.classList.add('active');
    }

    if (window.Creature && window.Creature.onMirrorToggle) {
        window.Creature.onMirrorToggle(state.isMirrored);
    }
});

cameraSwitchBtn.addEventListener('click', async () => {
    if (window.Creature && window.Creature.onCameraSwitch) {
        window.Creature.onCameraSwitch();
    }
    if (state.videoDevices.length > 1) {
        state.currentDeviceIndex = (state.currentDeviceIndex + 1) % state.videoDevices.length;
        const nextDevice = state.videoDevices[state.currentDeviceIndex];
        await startCamera(nextDevice.deviceId);
    } else {
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        await startCamera(null, currentFacingMode);
    }
});


// =========================================================
// CONTROLS (MODE, TIMER, DATE STAMP, FRAME COLOR)
// =========================================================

const modeButtons = document.querySelectorAll('#mode_selector .segment_btn');
const timerButtons = document.querySelectorAll('#timer_selector .segment_btn');
const stampToggleBtn = document.getElementById('stamp_toggle_btn');
const frameColorBar = document.getElementById('frame_color_bar');
const swatchButtons = document.querySelectorAll('.swatch_btn');
const dateStampDisplay = document.getElementById('date_stamp_display');
const topControlsRow = document.querySelector('.top_controls_row');
const themeControlGroup = document.getElementById('theme_control_group');

// Sliding indicator (glider) positioning
function updateSegmentGlider(segmentedControl) {
    if (!segmentedControl) return;
    const glider = segmentedControl.querySelector('.segment_glider');
    const activeBtn = segmentedControl.querySelector('.segment_btn.active');
    const buttons = Array.from(segmentedControl.querySelectorAll('.segment_btn'));
    if (!glider || !activeBtn) return;

    const activeIndex = buttons.indexOf(activeBtn);
    const isFirst = activeIndex === 0;
    const isLast = activeIndex === buttons.length - 1;

    let left = activeBtn.offsetLeft;
    let width = activeBtn.offsetWidth;

    // Overlap divider seams completely so no divider or white gap is ever exposed
    if (isFirst) {
        left = -4;
        width = activeBtn.offsetWidth + 6;
    } else if (isLast) {
        left = activeBtn.offsetLeft - 3;
        // Extend past the right inner border so container's overflow:hidden clips it seamlessly
        const fullRemaining = (segmentedControl.clientWidth - left) + 8;
        width = Math.max(activeBtn.offsetWidth + 6, fullRemaining);
    } else {
        left = activeBtn.offsetLeft - 3;
        width = activeBtn.offsetWidth + 6;
    }

    glider.style.width = `${width}px`;
    glider.style.transform = `translateX(${left}px)`;

    // Update helper classes for dividers
    buttons.forEach((btn, idx) => {
        btn.classList.remove('hide_divider');
        if (idx === activeIndex || idx === activeIndex - 1) {
            btn.classList.add('hide_divider');
        }
    });
}

// Set current date in classic retro format: 'YY MM DD
function getFormattedDateStamp() {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `'${yy} ${mm} ${dd}`;
}

dateStampDisplay.textContent = getFormattedDateStamp();

// Mode selector
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;

        updateSegmentGlider(btn.closest('.segmented_control'));

        // Smooth side-by-side transition for 4-cut strip frame color box
        if (state.mode === 'strip') {
            if (topControlsRow) {
                topControlsRow.classList.remove('strip_closing');
                topControlsRow.classList.add('strip_active');
            }
            frameColorBar.classList.add('show');
        } else {
            if (topControlsRow) {
                topControlsRow.classList.remove('strip_active');
                topControlsRow.classList.add('strip_closing');
                setTimeout(() => {
                    topControlsRow.classList.remove('strip_closing');
                }, 450);
            }
            frameColorBar.classList.remove('show');
        }

        // Re-sync gliders after CSS flex transition finishes
        setTimeout(() => {
            document.querySelectorAll('.segmented_control').forEach(updateSegmentGlider);
        }, 360);
    });
});

// Timer selector
timerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        timerButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.timer = parseInt(btn.dataset.timer, 10);
        updateSegmentGlider(btn.closest('.segmented_control'));
        if (window.Creature && window.Creature.setTimerActive) {
            window.Creature.setTimerActive(state.timer > 0);
        }
    });
});

// Timestamp toggle
stampToggleBtn.addEventListener('click', () => {
    state.dateStamp = !state.dateStamp;
    const indicator = stampToggleBtn.querySelector('.stamp_indicator');
    if (state.dateStamp) {
        stampToggleBtn.classList.add('active');
        if (indicator) indicator.textContent = 'ON';
    } else {
        stampToggleBtn.classList.remove('active');
        if (indicator) indicator.textContent = 'OFF';
    }
});

// Frame color swatch selector
swatchButtons.forEach(swatch => {
    swatch.addEventListener('click', () => {
        swatchButtons.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        state.frameColor = swatch.dataset.color;
    });
});

// Theme palette selector (4 color palettes)
const themeButtons = document.querySelectorAll('#theme_selector .theme_swatch_btn');

function applyTheme(themeName, isInitial = false) {
    document.body.dataset.theme = themeName;
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (themeControlGroup) {
        if (themeName === 'mono') {
            themeControlGroup.classList.add('mono_active');
        } else {
            themeControlGroup.classList.remove('mono_active');
        }
    }

    try {
        localStorage.setItem('ptb_theme', themeName);
    } catch (e) {
        console.warn('Could not save theme to localStorage:', e);
    }

    if (!isInitial && window.Creature && window.Creature.onThemeChange) {
        window.Creature.onThemeChange(themeName);
    }
}

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        applyTheme(theme, false);
    });
});

// Load saved theme on startup
const savedTheme = localStorage.getItem('ptb_theme') || 'mono';
applyTheme(savedTheme, true);

// Initialize gliders on start and window resize
function initAllGliders() {
    document.querySelectorAll('.segmented_control').forEach(updateSegmentGlider);
}

window.addEventListener('resize', initAllGliders);
window.addEventListener('load', initAllGliders);
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initAllGliders);
}
requestAnimationFrame(initAllGliders);
setTimeout(initAllGliders, 50);
setTimeout(initAllGliders, 150);


// =========================================================
// FILTER FUNCTIONALITY
// =========================================================

const filterButtons = document.querySelectorAll('.filters_list .filter_item');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentFilter = btn.dataset.filter || 'none';
        state.currentCamanPreset = btn.dataset.caman || 'none';
        videoElement.style.filter = state.currentFilter;
        if (window.Creature && window.Creature.onFilterChange) {
            window.Creature.onFilterChange(state.currentCamanPreset, state.currentFilter);
        }
    });
});


// =========================================================
// FLASH & COUNTDOWN ANIMATION
// =========================================================

const fakeFlash = document.querySelector('.layout_fakeflash');
const countdownOverlay = document.getElementById('countdown_overlay');
const countdownNumber = document.getElementById('countdown_number');
const countdownSubtitle = document.getElementById('countdown_subtitle');

function triggerFlash() {
    fakeFlash.classList.remove('flash_trigger');
    void fakeFlash.offsetWidth; // force reflow
    fakeFlash.classList.add('flash_trigger');
    if (window.Creature && window.Creature.onFlash) {
        window.Creature.onFlash();
    }
}

function runCountdown(seconds, subtitleText = 'GET READY!') {
    return new Promise((resolve) => {
        if (seconds <= 0) {
            resolve();
            return;
        }

        countdownOverlay.style.display = 'flex';
        countdownSubtitle.textContent = subtitleText;

        let remaining = seconds;
        countdownNumber.textContent = remaining;
        if (window.Creature && window.Creature.onCountdown) {
            window.Creature.onCountdown(remaining);
        }

        const timerInterval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                countdownNumber.textContent = remaining;
                if (window.Creature && window.Creature.onCountdown) {
                    window.Creature.onCountdown(remaining);
                }
            } else {
                clearInterval(timerInterval);
                countdownOverlay.style.display = 'none';
                resolve();
            }
        }, 1000);
    });
}


// =========================================================
// CANVAS RENDERING & PHOTO CAPTURE (WITH CAMANJS)
// =========================================================

const canvas = document.querySelector('.photo_canvas');
const context = canvas.getContext('2d');
const captureBtn = document.getElementById('take_photo_btn');
const photoResult = document.getElementById('photo_result');
const resultOverlay = document.getElementById('result_overlay');
const stripProgressBar = document.getElementById('strip_progress_bar');
const stripProgressText = document.getElementById('strip_progress_text');
const progressDots = document.querySelectorAll('.progress_dots .dot');

// Apply genuine CamanJS preset onto canvas
function applyCamanPreset(canvasElement, presetName) {
    return new Promise((resolve) => {
        if (!presetName || presetName === 'none' || typeof Caman === 'undefined') {
            resolve(canvasElement);
            return;
        }
        if (typeof Caman.prototype[presetName] !== 'function') {
            console.warn('Caman preset not available:', presetName);
            resolve(canvasElement);
            return;
        }
        try {
            Caman(canvasElement, function () {
                this.revert(false);
                this[presetName]();
                this.render(() => {
                    resolve(canvasElement);
                });
            });
        } catch (err) {
            console.warn('Caman rendering warning:', err);
            resolve(canvasElement);
        }
    });
}

// Capture a single frame from the live video with filter baked in
async function captureRawFrame() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth || 1280;
    tempCanvas.height = videoElement.videoHeight || 720;
    const ctx = tempCanvas.getContext('2d');

    ctx.save();

    // Mirror if enabled
    if (state.isMirrored) {
        ctx.translate(tempCanvas.width, 0);
        ctx.scale(-1, 1);
    }

    // Directly bake the active filter into canvas pixels for 100% visual parity with viewfinder
    if (state.currentFilter && state.currentFilter !== 'none') {
        ctx.filter = state.currentFilter;
    }

    ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.restore();

    return tempCanvas;
}

// Render a single photo with optional date stamp and frame
function renderSinglePhoto(rawCanvas) {
    canvas.width = rawCanvas.width;
    canvas.height = rawCanvas.height;

    // Draw frame
    context.drawImage(rawCanvas, 0, 0);

    // Draw date stamp if enabled
    if (state.dateStamp) {
        const dateStr = getFormattedDateStamp();
        const fontSize = Math.round(canvas.height * 0.05);
        context.font = `900 ${fontSize}px "Courier New", monospace, sans-serif`;
        context.textAlign = 'right';
        context.textBaseline = 'bottom';

        const padding = Math.round(canvas.width * 0.03);
        const x = canvas.width - padding;
        const y = canvas.height - padding;

        // Shadow outline
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillText(dateStr, x + 2, y + 2);

        // Retro digital orange
        context.fillStyle = '#ff9f1a';
        context.fillText(dateStr, x, y);
    }

    return canvas.toDataURL('image/png');
}

// Helper to draw rounded rectangle on canvas with broad browser compatibility
function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Render 4-cut vertical photo strip
function renderPhotoStrip(frames) {
    // 600px width strip, 4:3 cropped aspect ratio for each photo
    const stripWidth = 600;
    const sideMargin = 30;
    const topMargin = 32;
    const photoGap = 20;

    const photoWidth = stripWidth - (sideMargin * 2); // 540px
    const photoHeight = Math.round(photoWidth * (3 / 4)); // 405px

    const bottomSectionHeight = 150;
    const totalHeight = topMargin + (photoHeight * 4) + (photoGap * 3) + bottomSectionHeight;

    canvas.width = stripWidth;
    canvas.height = totalHeight;

    // 1. Fill background with chosen frame color
    context.fillStyle = state.frameColor;
    context.fillRect(0, 0, stripWidth, totalHeight);

    const photoRadius = 14;

    // 2. Draw 4 photos with rounded corners
    frames.forEach((frameCanvas, index) => {
        const photoY = topMargin + (index * (photoHeight + photoGap));

        // Source crop to 4:3
        const srcW = frameCanvas.width;
        const srcH = frameCanvas.height;
        const targetRatio = 4 / 3;

        let cropW = srcW;
        let cropH = srcW / targetRatio;
        if (cropH > srcH) {
            cropH = srcH;
            cropW = srcH * targetRatio;
        }
        const cropX = (srcW - cropW) / 2;
        const cropY = (srcH - cropH) / 2;

        context.save();
        drawRoundedRect(context, sideMargin, photoY, photoWidth, photoHeight, photoRadius);
        context.clip();

        context.drawImage(
            frameCanvas,
            cropX, cropY, cropW, cropH,
            sideMargin, photoY, photoWidth, photoHeight
        );
        context.restore();

        // Thin rounded inner border around each photo for a refined look
        context.save();
        drawRoundedRect(context, sideMargin, photoY, photoWidth, photoHeight, photoRadius);
        context.strokeStyle = isColorDark(state.frameColor) ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
        context.lineWidth = 2.5;
        context.stroke();
        context.restore();
    });

    // 3. Draw bottom branding section
    const textColor = isColorDark(state.frameColor) ? '#ffffff' : '#121212';
    const subTextColor = isColorDark(state.frameColor) ? '#cccccc' : '#555555';

    const brandCenterY = totalHeight - (bottomSectionHeight / 2);

    context.textAlign = 'center';
    context.fillStyle = textColor;
    context.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    context.fillText('PHOTOBOOTH STATION', stripWidth / 2, brandCenterY - 14);

    context.fillStyle = subTextColor;
    context.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    context.fillText('RETRO SNAP STUDIO', stripWidth / 2, brandCenterY + 12);

    if (state.dateStamp) {
        context.fillStyle = isColorDark(state.frameColor) ? '#ff9f1a' : '#d63031';
        context.font = '900 14px "Courier New", monospace';
        context.fillText(getFormattedDateStamp(), stripWidth / 2, brandCenterY + 38);
    }

    return canvas.toDataURL('image/png');
}

// Helper to check if frame color is dark (for text contrast)
function isColorDark(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}


// =========================================================
// CAPTURE CONTROLLER
// =========================================================

captureBtn.addEventListener('click', async () => {
    if (state.isCapturing) return;
    state.isCapturing = true;
    captureBtn.disabled = true;

    if (window.Creature && window.Creature.onTakeInitiated) {
        window.Creature.onTakeInitiated();
    }

    try {
        if (state.mode === 'single') {
            // Single shot flow
            await runCountdown(state.timer, 'SMILE!');
            triggerFlash();

            const raw = await captureRawFrame();
            const finalImg = renderSinglePhoto(raw);

            // Creature swallows / eats the photo playfully before showing results
            if (window.Creature && window.Creature.eatPhoto) {
                await window.Creature.eatPhoto(finalImg);
            }

            showResult(finalImg);

        } else {
            // 4-Cut Strip flow
            stripProgressBar.style.display = 'flex';
            const capturedFrames = [];

            for (let shot = 1; shot <= 4; shot++) {
                // Update progress indicator
                stripProgressText.textContent = `Photo ${shot} of 4`;
                progressDots.forEach((dot, idx) => {
                    if (idx < shot) dot.classList.add('active');
                    else dot.classList.remove('active');
                });

                // Countdown for each shot (use selected timer or default 3s)
                const countTime = state.timer > 0 ? state.timer : 3;
                await runCountdown(countTime, `SHOT ${shot} OF 4!`);

                triggerFlash();

                const raw = await captureRawFrame();
                capturedFrames.push(raw);

                // Small pause between shots (if not last)
                if (shot < 4) {
                    await new Promise(r => setTimeout(r, 800));
                }
            }

            stripProgressBar.style.display = 'none';

            // Stitch frames into vertical strip
            const finalImg = renderPhotoStrip(capturedFrames);

            // Creature swallows / eats the completed strip playfully
            if (window.Creature && window.Creature.eatPhoto) {
                await window.Creature.eatPhoto(finalImg);
            }

            showResult(finalImg);
        }

    } catch (err) {
        console.error('Capture failed:', err);
    } finally {
        state.isCapturing = false;
        captureBtn.disabled = false;
        if (window.Creature && window.Creature.shell) {
            window.Creature.shell.classList.remove('portal_capturing', 'take_anticipation', 'creature_excited');
        }
    }
});


// =========================================================
// SHOW RESULT MODAL
// =========================================================

function showResult(imgURL) {
    state.currentResultDataUrl = imgURL;
    photoResult.src = imgURL;

    // Add to history and persist
    addToHistory(imgURL);

    // Creature notices the new photo appearing in History
    if (window.Creature && window.Creature.onPhotoAppearedInHistory) {
        window.Creature.onPhotoAppearedInHistory();
    }

    // Reveal overlay
    setTimeout(() => {
        resultOverlay.style.display = 'flex';
    }, 400);
}


// =========================================================
// RESULT MODAL ACTIONS (DOWNLOAD, PRINT, COPY, RETAKE)
// =========================================================

const closeResultBtn = document.getElementById('close_result_btn');
const downloadBtn = document.getElementById('download_btn');
const printBtn = document.getElementById('print_btn');
const copyBtn = document.getElementById('copy_btn');
const retakeBtn = document.getElementById('retake_btn');
const sendModalOpenBtn = document.getElementById('send_modal_open_btn');
const printImage = document.getElementById('print_image');

// Close modal
closeResultBtn.addEventListener('click', () => {
    resultOverlay.style.display = 'none';
});

retakeBtn.addEventListener('click', () => {
    resultOverlay.style.display = 'none';
});

// Download PNG
downloadBtn.addEventListener('click', () => {
    if (!state.currentResultDataUrl) return;
    const a = document.createElement('a');
    a.href = state.currentResultDataUrl;
    const filenamePrefix = state.mode === 'strip' ? 'photobooth-strip' : 'photobooth-photo';
    a.download = `${filenamePrefix}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Print
printBtn.addEventListener('click', () => {
    if (!state.currentResultDataUrl) return;
    printImage.src = state.currentResultDataUrl;
    window.print();
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    if (!state.currentResultDataUrl) return;

    try {
        const res = await fetch(state.currentResultDataUrl);
        const blob = await res.blob();

        if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);

            const textEl = copyBtn.querySelector('.btn_morph_text');
            if (textEl) textEl.textContent = 'Copied!';
            setTimeout(() => {
                if (textEl) textEl.textContent = 'Copy';
            }, 1800);
        } else {
            alert('Clipboard image copying is not supported in this browser. Please use Download PNG.');
        }
    } catch (err) {
        console.warn('Copy failed:', err);
        alert('Could not copy image to clipboard. Please download instead.');
    }
});


// =========================================================
// EMAIL FUNCTIONALITY
// =========================================================

const emailOverlay = document.getElementById('email_overlay');
const emailInput = document.getElementById('email_input');
const emailSendBtn = document.getElementById('email_send_btn');
const emailCancelBtn = document.getElementById('email_cancel_btn');

sendModalOpenBtn.addEventListener('click', () => {
    alert('DEVELOPING - Let waiting for it, thanks!:)');
});

emailCancelBtn.addEventListener('click', () => {
    emailOverlay.style.display = 'none';
    emailInput.value = '';
});

emailSendBtn.addEventListener('click', () => {
    alert('DEVELOPING - Let waiting for it, thanks!:)');
    emailOverlay.style.display = 'none';
    emailInput.value = '';
});

emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        emailSendBtn.click();
    }
});


// =========================================================
// HISTORY & LOCALSTORAGE PERSISTENCE
// =========================================================

const historyList = document.getElementById('history_list');
const historyEmpty = document.getElementById('history_empty');
const clearHistoryBtn = document.getElementById('clear_history_btn');
const STORAGE_KEY = 'ptb_station_photos_v1';

function getStoredHistory() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveStoredHistory(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.warn('History storage limit reached:', e);
    }
}

function addToHistory(imgURL) {
    const history = getStoredHistory();
    const newId = Date.now().toString();
    history.unshift({
        id: newId,
        dataUrl: imgURL,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Cap at 10 recent captures to stay well within localStorage limits
    if (history.length > 10) {
        history.pop();
    }

    saveStoredHistory(history);
    renderHistory(newId);
}

function deleteHistoryItem(id, e) {
    e.stopPropagation();
    let history = getStoredHistory();
    history = history.filter(item => item.id !== id);
    saveStoredHistory(history);
    renderHistory();
}

function clearAllHistory() {
    if (!confirm('Are you sure you want to clear all history photos?')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
}

clearHistoryBtn.addEventListener('click', clearAllHistory);

function renderHistory(newestId) {
    const history = getStoredHistory();

    // Clear existing thumbnails
    const items = historyList.querySelectorAll('.history_item');
    items.forEach(el => el.remove());

    if (history.length === 0) {
        historyEmpty.style.display = 'block';
        clearHistoryBtn.style.display = 'none';
        return;
    }

    historyEmpty.style.display = 'none';
    clearHistoryBtn.style.display = 'block';

    history.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('history_item');
        if (newestId && item.id === newestId) {
            btn.classList.add('memory_new_pulse');
            setTimeout(() => {
                btn.classList.remove('memory_new_pulse');
            }, 1800);
        }
        btn.title = `Click to view captured photo (${item.timestamp})`;

        const img = document.createElement('img');
        img.src = item.dataUrl;
        img.alt = 'Captured photo';

        const delBtn = document.createElement('span');
        delBtn.classList.add('history_item_delete');
        delBtn.textContent = '×';
        delBtn.title = 'Delete this photo';
        delBtn.addEventListener('click', (e) => deleteHistoryItem(item.id, e));

        const badge = document.createElement('span');
        badge.classList.add('history_item_badge');
        badge.textContent = item.timestamp;

        btn.appendChild(img);
        btn.appendChild(delBtn);
        btn.appendChild(badge);

        btn.addEventListener('mouseenter', () => {
            if (window.Creature && window.Creature.onMemoryHover) {
                window.Creature.onMemoryHover();
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (window.Creature && window.Creature.onMemoryLeave) {
                window.Creature.onMemoryLeave();
            }
        });

        btn.addEventListener('click', () => {
            state.currentResultDataUrl = item.dataUrl;
            photoResult.src = item.dataUrl;
            resultOverlay.style.display = 'flex';
        });

        historyList.appendChild(btn);
    });
}

// Render saved history on load
renderHistory();

