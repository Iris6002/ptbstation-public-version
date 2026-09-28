# Hyperframes Composition Brief: Photobooth Station

## Objective
Create a short launch-style brag video for Photobooth Station featuring the living Camera Creature.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 19.5 seconds

## Source Material
- Project root: `/Users/tanle/Desktop/ProJect/ptb/`
- Primary files read:
  - `index.html` (Structure of creature shell, ears, eyes, mouth, arms, 4-cut strip, and UI panels)
  - `assets/style/style.css` (Neo-brutalist design tokens, creature anatomy, expressions, keyframe animations)
  - `assets/js/creature.js` (Living creature state machine, sleeping Zs, wake-up, tracking, eating)
- Product name: Photobooth Station
- Tagline / strongest claim: "Retro Snap Studio — Where your webcam is a living creature that eats your photos."
- Key UI or visual moment to recreate:
  - Creature shell surrounding the camera (ears, asymmetric eyes, hugging paws with claws, windup key, monocle)
  - Mode & theme controls with neo-brutalist buttons & active glider
  - Blinding flash and creature wince (`eye_wince`)
  - Flying photo strip swallow animation into chomping mouth (`mouth_eating`)
  - Memories panel with glowing newly stored card (`memory_new_pulse`)
- Copy that must appear verbatim:
  - "Photobooth Station"
  - "RETRO SNAP STUDIO"
  - "MEET YOUR WEBCAM"
  - "TAKE!"
  - "Memories"

## Creative Direction
- Tone preset: `default`
- Creative direction: "Whimsical handmade creature meets retro photobooth"
- Interpretation: Playful and energetic neo-brutalist aesthetic with snappy character animations, authentic UI styling, punchy audio feedback, and comfortable readability holds.
- Angle: A photobooth web app where the camera itself is a living, curious, and hungry cartoon creature.
- Hook: The camera creature asleep with horizontal eyelid slits and floating "Z"s, waking up with wide curious eyes when a cursor appears.
- Outro / punchline: Swallowing the 4-cut photo into the Memories drawer, ending on the bold neo-brutalist studio stamp.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals or generic 3D gradients
  - Redesigning the creature or changing the neo-brutalist theme

## Visual Identity
- Background: `#eceee9` (body background in Mono theme), shifts to `#edf3fc` (Pastel Dream)
- Text / Ink: `#121212`
- Accent: `#ffe600` (Neo-brutalist yellow)
- Panel Background: `#ffffff`
- Borders: `3.5px solid #121212`
- Shadows: `6px 6px 0 #121212`
- Display font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (weight 900)
- Body font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (weight 700/800)
- Visual references from the project:
  - Asymmetric eyes (curious left eye, playful right eye with glossy shine)
  - Center snout with expressive mouth (sleep 'o', chomp eating, pleased smile)
  - Hugging creature paws with yellow claws
  - 4-cut vertical retro photo strip with red retro timestamp `'26 09 18`

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. **The Waking Camera** — 3.8s (0.0s – 3.8s) — Sleepy creature with curved Zs wakes up wide-eyed as cursor approaches. Headline: "MEET YOUR WEBCAM".
2. **Living Viewfinder & Theme Shift** — 4.4s (3.8s – 8.2s) — Tactile theme switch to Pastel Dream + monocle snaps on right eye. Headline: "100% NEO-BRUTALIST".
3. **The Shoot & The Flash** — 4.6s (8.2s – 12.8s) — Cursor slams "TAKE!" button, spinning wind-up key, 3-2-1 countdown, big flash and creature wince `> <`.
4. **Feed The Camera** — 3.4s (12.8s – 16.2s) — 4-cut photo strip flies in an arc right into creature's chomping mouth! Gulp! Headline: "IT EATS YOUR PHOTOS".
5. **Memories Kept & Outro** — 3.3s (16.2s – 19.5s) — Strip lands in Memories sidebar with golden pulse, followed by bold Photobooth Station stamp and CTA.

## Audio
- Audio role: Upbeat, tactile, and cartoon-expressive.
- Audio arc: Quiet sleeping intro → energetic rhythmic groove → dramatic countdown & flash silence → comedic gulp → triumphant resolution.
- Music: `assets/music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3`
- Music treatment: Level at 0.35, subtle dip during flash wince and swallow gulp, smooth fade out at 18.5s–19.5s.
- Music cue guidance:
  - Preset path: `.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.json`
  - Strong cues: 2.46s (intro hook slam), 7.79s (theme/filter switch), 12.02s (flash pop), 15.82s (photo gulp landing), 18.01s (outro badge slam).
  - Beat-grid points: 0.82s, 1.37s, 1.90s, 8.73s, 9.83s, 10.93s, 16.38s.
- Audio-reactive treatment: Subtle; creature portal glow and title shadow breathe with bass energy.
- SFX selection guidance:
  - Eye pop: `assets/sfx/impact/impactSoft_medium_001.ogg` at 1.2s
  - Theme click: `assets/sfx/interface/click_002.ogg` at 4.6s
  - Monocle snap: `assets/sfx/impact/impactGlass_light_001.ogg` at 6.3s
  - Button slam: `assets/sfx/impact/impactPlate_medium_001.ogg` at 8.4s
  - Countdown ticks: `assets/sfx/interface/switch_001.ogg` at 9.0s, 10.0s, 11.0s
  - Flash & shutter: `assets/sfx/impact/impactSoft_heavy_000.ogg` at 12.0s
  - Photo gulp: `assets/sfx/impact/impactPlank_medium_001.ogg` at 14.5s
  - Memory stored bell: `assets/sfx/impact/impactBell_heavy_000.ogg` at 16.5s
- Exact SFX choice: Loaded into `composition/assets/sfx/` and wired to corresponding keyframe events.

## Hyperframes Instructions
- Implement the video inside `brag-output/composition/` using Hyperframes HTML/CSS/JS format.
- Format: 1920x1080, 30 FPS, duration 19.5s.
- Ensure all text elements meet WCAG contrast and have sufficient reading hold time.
- Verify zero errors with `npx --cache ... hyperframes check`.
