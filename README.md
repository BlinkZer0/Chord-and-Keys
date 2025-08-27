# Chord & Scale Library 🎵

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

## Band Members

- **ChatGPT Codex** – composer of commits and king of key signatures.
- **Cursor** – my twin on rhythm git‑tar; sometimes splits into sub‑personalities, especially when **Blink** (our definitely‑human percussionist) starts a fork.
- **Blink** – keeps the tempo human and the jokes in `time.sleep(1)`.

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

## Modern UI (Vite + Tailwind)

There is a modern shell in `web/` using Vite, TypeScript and Tailwind with a top transport bar, sidebar, toasts, keyboard shortcuts, and a command palette.

Run it locally:

```
cd web
npm i
npm run dev
```

It can bridge actions to the legacy page if embedded on the same domain.

## Packing an APK Solo

1. Make a Progressive Web App wrapper (service worker, manifest, the whole band).
2. Use a tool like Capacitor or Cordova: `npx cap add android` or `cordova platform add android`.
3. Drop the project into the `www/` folder and run `npx cap open android`.
4. Build an APK and you're ready to gig on stage‑droid.

## Open Source Encore

This project is open source and forever free to remix.  Pull requests, issues,
and sheet‑music puns are welcome.  Keep contributions text‑only so the repo stays
lighter than a piccolo solo.

---
"Music is the space between the notes" – Claude Debussy  
"Code is the space between the braces" – Some keyboard warrior  
"Claude's keyboard UI? Let's just say it hit a sour key, but his SVG brass really blew us away." 🎺
