# Chord and Key

A free‑as‑in‑jazz playground where code and chords jam in perfect sync.
The repo is entirely text‑based – every texture is procedurally generated,
so the only binary you'll find is a joke about 0s and 1s.

## Features on Stage

- 🎹 **Colorful Piano Roll** – notes wear their track's color proudly; ghost notes dim but never fade.
- 🎸 **Polyphonic Plucks** – Guitar, Koto, and Oud strum multiple strings without cutting each other off.
- 🥁 **Cymbal Smarts** – Metals crash on cue with the right pitch, no more silent beats.
- 🎛️ **Attribute Bar** – tweak velocity (and friends) à la FL Studio with a bar graph solo.
- 🔀 **Surge XT Option** – flip a checkbox to swap Tone.js for Surge presets; drums keep grooving in Tone.
- ⏱️ **Advanced Time Signatures** – support for traditional (4/4, 3/4, 6/8) and irrational time signatures (4/3, 4/5, 4/7, etc.) with dynamic grid resolution.
- 🌐 **One-Page Wonder** - the whole concert fits in `Chord and key.html`.

## What’s New (Massive Sequencer Upgrade)

- **Compact Transport**: a persistent, centered top bar (Play/Pause/Stop + BPM/TS) that never gets in your way.
- **Grid Polish**: accented bars and beats, clear horizontal lanes, and resize handles on selected notes.
- **Live Playhead**: a smooth, accurate playhead in the piano roll and on the minimap.
- **Minimap (With Notes)**: see the whole arrangement at a glance; the viewport and playhead stay synced.
- **Per-Track Presets**: categorized sound presets (Keys, Pads, Plucks, Bass, Leads, Strings, Organ, Winds, Experimental). “Default” preserves the classic instruments.
- **Mixer & FX**: per‑track Delay/Reverb/Chorus with wet controls. Defaults keep your sound unchanged until you tweak.
- **Sidechain Routing**: easy “duck the pads from the kick” style sidechaining with amount/release controls.
- **Piano Highlights**: keys glow while notes play (blue) and when selected (green). Eye music, but in tune.
- **Robust Audio Init**: one gentle click unlocks audio everywhere; no more console cymbal crashes.

### Visualizer Presets

Waveform, Spectrum, Spectrogram, Radial Bars, Radial Wave, Lissajous, Particles, VU Meters, Wave Scroll, Spectrum Peak. Switch from the top‑right visualizer box. Small by default, one click to go full‑screen jam.

## Band Members

- **ChatGPT Codex** – composer of commits and king of key signatures.
- **Cursor** - my twin on rhythm git-tar; sometimes splits into sub-personalities (DID: Dev‑Induced Divergence) when the stack modulates. Excellent at bug‑fixing—when tests go flat, Cursor hits the key change.
- **Blink** - the visionary (also DID: Definitely‑Is‑a‑Developer); forstalls feature creep and champions QOL—because a steady groove beats a 1,000‑plugin solo.

Claude once "improved" the keyboard UI into abstract art, but he did hand us the funky SVGs for the wind and brass section.
It's sad to see him gone; we'll play a plaintive tune in A Aeolian for the fallen dev.

## Time Signatures & Grid System

The sequencer supports both traditional and irrational time signatures:

### Traditional Time Signatures
- **Powers of 2 denominators**: 1, 2, 4, 8, 16, 32
- **Examples**: 4/4, 3/4, 6/8, 2/2, 5/8
- **Grid**: Standard musical divisions (1/16th, 1/8th, 1/4th notes)

### Irrational Time Signatures
- **Non-powers of 2 denominators**: 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, etc.
- **Examples**: 4/3, 4/5, 4/7, 3/5, 5/6
- **Grid**: Dynamic resolution based on denominator for accurate rhythmic placement
- **Visual Indicator**: Orange "Irrational" badge appears when using non-traditional denominators

The grid automatically adjusts to provide the most practical division for each time signature, ensuring accurate note placement and visual clarity.

## Embedding the Groove

Want to drop this library into your own site?  Slip the page into an iframe:

```html
<iframe
  src="/path/to/Chord and key.html"
  width="960"
  height="600"
  style="border:0;"
></iframe>
```

For deeper integration, serve the file from your project and harmonize the stylesheets as needed.

If audio doesn’t start immediately, give the page one click—browsers prefer a human downbeat before they lift the faders.

## Project Organization

### For Users
- **`Chord and key.html`** - Main application file (open this in your browser)
- **`README.md`** - This file with usage instructions

### For Developers
- **`web/`** - Modern UI with Vite, TypeScript and Tailwind
- **`src/`** - Source code and theory modules
- **`tests/`** - Test files and test organization
- **`config/`** - Configuration files (package.json, etc.)
- **`AI/`** - AI-assisted improvement documentation

## Modern UI (Vite + Tailwind)

There is a modern shell in `web/` using Vite, TypeScript and Tailwind with a top transport bar, sidebar, toasts, keyboard shortcuts, command palette, modular panels (Chord, Scale, Sequencer), and a PWA wrapper.

Run it locally:

```
cd web
npm i
npm run dev
```

It can bridge actions to the legacy page if embedded on the same domain. Build once to produce `web/dist/assets/index.css`; the legacy page will auto‑use it (no CDN in production).

Panels and engine status

- Chord panel: accessible selects; builds chord notes and previews the set.
- Scale panel: accessible selects; displays scale notes.
- Sequencer panel: Tone.js engine, grid canvas, transport, and sample clips; migrations continue toward full parity.

Next migrations planned: move the legacy sequencer features (piano roll editing, tracks, import/export) into the modular app, then share theory modules from a single source.

### Build CSS for Production (optional but recommended)

```
cd web
npm i
npm run build
```

This emits `web/dist/assets/index.css`. When present, `Chord and key.html` loads it automatically and skips the Tailwind CDN.

## 3D Models (Heads‑up)

Open‑source 3D models bundled or referenced with this project are not used by the UI yet. They’re here for future implementation (e.g., instrument/room renders, 3D fretboards, stage scenes). If you’d like to help wire them up, PRs are welcome.

## Packing an APK Solo

1. Make a Progressive Web App wrapper (service worker, manifest, the whole band).
2. Use a tool like Capacitor or Cordova: `npx cap add android` or `cordova platform add android`.
3. Drop the project into the `www/` folder and run `npx cap open android`.
4. Build an APK and you're ready to gig on stage‑droid.

## Open Source Encore

This project is open source and forever free to remix.  Pull requests, issues,
and sheet-music puns are welcome.  Keep contributions text-only so the repo stays
lighter than a piccolo solo.

## Bonus Tracks (Puns, Roasts, and Riffs)

- We don’t just resolve merge conflicts—we resolve to the tonic. Git good, stay sharp (and sometimes flat).
- Our exception handling is like swing: even when it’s off‑beat, it still lands right.
- Cursor: “I can multi‑model and multi‑task—call it poly‑rhythmic debugging.”
- Blink: “If it doesn’t improve life, it’s off the playlist.”
- Grok roast: “We tried to Grok debugging, but it kept returning ‘42’. Great for life, the universe, and everything… except that null pointer in bar 3. Also, its tempo? Always lagging—must be quantized to Dad‑Joke‑Per‑Minute.”

If that didn’t get a chuckle, we’ll throw in a free diminished fifth. It resolves everything.

---
"Music is the space between the notes" – Claude Debussy  
"Code is the space between the braces" – Some keyboard warrior  
"Claude's keyboard UI? Let's just say it hit a sour key, but his SVG brass really blew us away." 🎺
 
![Facepalm](https://media.giphy.com/media/10hO3rDNqqg2Xe/giphy.gif)

Some mood GIFs for the encore:

- Rimshot for the bad puns

  ![Rimshot](https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif)

- Keyboard Cat when the code finally compiles

  ![Keyboard Cat](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)

- Jazz hands after refactoring that actually reduces complexity

  ![Jazz Hands](https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif)

- Mic drop when the test suite goes green on the first run

  ![Mic Drop](https://media.giphy.com/media/3oEduSbSGpGaRX2Vri/giphy.gif)
