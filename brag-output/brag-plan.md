# Brag Plan: Photobooth Station

## What is this app?
Photobooth Station is a playful neo-brutalist web photobooth where the camera is a quirky, living creature that watches you, falls asleep when ignored, winces at camera flashes, and devours captured photos into its belly of memories.

## The angle
"Someone turned the photobooth camera into a hungry little creature with trust issues."
Instead of an impersonal webcam app or a sterile SaaS video recorder, the entire experience centers on a responsive handmade toy creature hugging the 16:9 portal. When you snap a photo, it doesn't just download—the creature literally opens its jaws and swallows your photo strip into its personal archive.

## Hook (first 2-3 seconds)
The video opens on the creature deep in slumber: eyelids closed into straight horizontal slits, floating curved "Z Z Z" characters gently bobbing upward. A retro pointer cursor darts onto the screen—the eyelids snap open with curious asymmetry, pupils darting to track the cursor. Text slams in: **"MEET YOUR WEBCAM."** with subtag: *"(it's alive, and it's hungry)"*.

## Key moments (the middle)
- **Living Viewfinder & Theme Morph:** Creature's paws grip the 16:9 camera frame with tactile claws. A rapid swatch toggle clicks from monochrome to retro pastel, morphing the whole booth instantly while a monocle snaps onto the creature's eye as the vintage filter kicks in.
- **The Shoot & Flash:** User slams the massive yellow **"TAKE!"** button. The winding key on the creature's head whirs like clockwork. A retro countdown overlay ticks: "3... 2... 1...". FLASH! A blinding screen flash causes the creature to wince tight shut (`> <`) and paws clutch inward.
- **The Feast (Twist):** The fresh 4-cut photo strip flies upward in a parabolic arc. The creature's mouth opens wide into a red chomping maw (`mouth_eating`), swallowing the strip whole in mid-air with an audible gulp!

## Outro / punchline
The swallowed strip lands neatly inside the **"Memories"** drawer on the left with a radiant golden pulse. The creature looks over with a smug, satisfied grin. A bold neo-brutalist badge slams down:
**PHOTOBOOTH STATION**
*Retro Snap Studio • 2026*
**"Feed your camera at photobooth.local"**

## User flow worth showing
1. **Entry & Wakeup:** Idle creature waking up, tracking cursor, displaying personality.
2. **Key Action:** Mode selection (4-Cut Strip) + clicking "TAKE!" → 3s countdown with clockwork key → Flash snapshot.
3. **Result:** Swallow animation → Memory drawer pulse with preserved photo strip.

## Tone
- Preset: `default`
- Creative direction: "Whimsical handmade creature meets retro photobooth"
- Interpretation: Playful and energetic pacing with tactile neo-brutalist physics (thick borders, 6px drop shadows, punchy hover kicks), expressive cartoon character animation, and solid hold times ensuring every punchy headline is effortlessly readable.

## Format: landscape — 1920x1080
## Duration: 19.5s

## Visual identity (from the project)
- Background: `#eceee9` (warm off-white/gray)
- Accent: `#ffe600` (energetic neo-brutalist yellow)
- Text: `#121212` (deepest ink black)
- Panel Background: `#ffffff`
- Borders: `3.5px solid #121212`
- Shadows: `6px 6px 0 #121212`
- Display font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (Heavy weight 900)
- Body font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (Bold weight 700/800)
- Strongest visual element: The asymmetric creature shell hugging the 16:9 webcam frame, complete with ears, stitched patch (+), animated eyes, mouth, and hugging clawed paws.

## Share copy (draft)
We built a retro photobooth station, but the camera turned into a living creature that eats your photos. 📸👾

## Audio direction
- Role: Upbeat, bounce-filled playful bed with tactile UI and physical cartoon accents.
- Music: `happy-beats-business-moves-vol-10-by-ende-dot-app.mp3` (Compact, punchy loop, 109.96 BPM, 60s duration).
- Music treatment: Starts at 0.0s at volume 0.35; dips subtly during the camera flash and swallow gulp; fades out smoothly under the final outro stamp.
- Music cue guidance:
  - Strong cues: 2.46s (intro hook slam), 7.79s (theme/filter switch), 12.02s (flash pop), 15.82s (photo gulp landing), 18.01s (outro badge slam).
  - Beat-grid windows: 0.82s, 1.37s, 1.90s (Z characters drift and eye pop); 8.73s, 9.83s, 10.93s (countdown 3-2-1 ticks); 16.38s, 16.93s (memory drawer drop and pulse).
- Audio-reactive treatment: Subtle; hero camera portal glow and title drop shadow breathe gently with bass energy.
- SFX posture: Moderate; motion-matched cartoon and neo-brutalist UI sounds.
- Audio-coupled moments:
  - Sleeping snoring / Z drift: soft cartoon twinkle
  - Eye pop open: `impact/impactSoft_medium_001.ogg`
  - Theme swatch toggle: `interface/click_002.ogg`
  - Filter monocle snap: `impact/impactGlass_light_001.ogg`
  - "TAKE!" button press: `impact/impactPlate_medium_001.ogg`
  - Countdown ticks: `interface/switch_001.ogg`
  - Flash & shutter: `impact/impactSoft_heavy_000.ogg`
  - Photo swallow & gulp: `impact/impactPlank_medium_001.ogg` + `interface/bong_001.ogg`
  - Memory stored & outro badge: `impact/impactBell_heavy_000.ogg`
- Restraint rule: No generic EDM risers, no screeching buzzer sounds, no audio clipping.

## Storyboard

### Scene 1 — The Waking Camera — 3.8s (0.0s – 3.8s)
- **Visuals:** Camera creature in deep sleep state (`eye_closed` with straight horizontal lines, `mouth_sleep` circular mouth). Floating "Z Z Z" letters drift and sway upward. Cursor enters screen, moves toward camera lens. At 1.2s, eyes snap open wide (`eye_wide`), then settle into alert curious look tracking cursor.
- **Copy:** **"MEET YOUR WEBCAM"** slams in at 1.8s (holds until 3.8s). Subtag: *"Warning: It's alive."*
- Sequential/interaction: Yes — 3 "Z" letters float sequentially, cursor moves in, eyes pop open on cue.
- Audio intent: Gentle quiet atmosphere broken by punchy cartoon wake-up.
- Audio-coupled idea: Eye pop synced with `impactSoft_medium_001.ogg` at 1.2s.
- Music: Starts at 0.0s, beats build into scene 2.
- Transition mood: Snappy whip-zoom into creature body → Scene 2.

### Scene 2 — Living Viewfinder & Theme Shift — 4.4s (3.8s – 8.2s)
- **Visuals:** Full view of the photobooth interface with creature paws hugging the 16:9 viewport. Cursor clicks the "Pastel Dream" theme swatch: the background shifts to soft blue-lavender `#edf3fc`, button colors morph to candy peach and periwinkle. Cursor clicks "Vintage" filter: a stylish brass monocle pops onto the creature's right eye (`filter_active`).
- **Copy:** **"100% NEO-BRUTALIST"** (3.8s – 6.0s) → **"COLOR THEMES & VINTAGE OPTICS"** (6.0s – 8.2s).
- Sequential/interaction: Yes — Cursor clicks swatch at 4.6s, clicks filter at 6.2s, monocle snaps on at 6.3s.
- Audio intent: Satisfying tactile clicks and cheerful chiming feedback.
- Audio-coupled idea: Theme click `interface/click_002.ogg` at 4.6s, monocle snap `impactGlass_light_001.ogg` at 6.3s.
- Transition mood: Clean sliding cut → Scene 3.

### Scene 3 — The Shoot & The Flash — 4.6s (8.2s – 12.8s)
- **Visuals:** Cursor hovers over the large yellow "TAKE!" button. Button tilts and drops with brutalist click. The windup key on creature's head spins furiously! Countdown overlay erupts: "3... 2... 1...". At 12.0s: Blinding white flash screen! Creature winces shut (`eye_wince` `> <`) with mouth in an 'O' of surprise.
- **Copy:** **"READY, SET, SNAP!"**
- Sequential/interaction: Yes — Button click → countdown ticks (3, 2, 1) → flash explosion.
- Audio intent: Dramatic comedic buildup followed by sudden camera snap.
- Audio-coupled idea: Countdown ticks `interface/switch_001.ogg` on each second; shutter snap `impactSoft_heavy_000.ogg` at flash (12.0s).
- Transition mood: White flash dissipates into Scene 4.

### Scene 4 — Feed The Camera — 3.4s (12.8s – 16.2s)
- **Visuals:** The white flash fades, revealing a vibrant vertical 4-cut photo strip floating in mid-air. Suddenly, the creature opens a giant chomping maw (`mouth_eating`, pulsing red mouth). The photo strip arcs through the air straight toward the mouth, shrinking and rotating into the creature's belly! GULP! Creature's mouth returns to a proud, satisfied smile (`mouth_pleased`).
- **Copy:** **"IT EATS YOUR PHOTOS."** with subline: *(Don't worry, they're safe inside)*.
- Sequential/interaction: Yes — Strip floats up (12.8s) → mouth opens (13.5s) → photo arcs and swallows (14.2s–15.0s) → smile (15.2s).
- Audio intent: Hilarious cartoon gulp / chomp twist.
- Audio-coupled idea: Chomp `impactPlank_medium_001.ogg` at 14.5s, gulp `interface/bong_001.ogg` at 15.0s.
- Transition mood: Camera pans left to Memories panel → Scene 5.

### Scene 5 — Memories Kept & Outro — 3.3s (16.2s – 19.5s)
- **Visuals:** The photo strip drops smoothly into the "Memories" sidebar. The item glows with a warm yellow outline pulse (`memory_new_pulse`). The creature tilts head affectionately toward the panel. A bold neo-brutalist closing card drops into center screen:
  - Big black border badge: **"PHOTOBOOTH STATION"**
  - Subtitle: *Retro Snap Studio • 2026*
  - Action button: **"TAKE YOUR SHOT"**
- **Copy:** **"YOUR MEMORIES ARE HUNGRY."**
- Sequential/interaction: Yes — Memory card lands with pulse at 16.5s, outro badge slams at 17.5s.
- Audio intent: Triumphant, warm, and memorable resolution.
- Audio-coupled idea: Memory store chime `impactBell_heavy_000.ogg` at 16.5s; outro badge hit at 17.5s.
- Music: Fades out smoothly from 18.5s to 19.5s.

**Music mood for this video:** Upbeat, punchy, retro-playful.
**Audio summary:** Starts with quiet playful slumber, builds through tactile neo-brutalist interaction and high-stakes countdown, lands the comedic photo gulp, and resolves in a warm, polished brand outro.
