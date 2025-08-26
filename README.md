# Chord & Scale Library

This repository contains a single HTML page providing a fully functional interactive chord and scale explorer. The page is built entirely with client-side code and relies on [Tailwind CSS](https://tailwindcss.com/) for styling and [Tone.js](https://tonejs.github.io/) for audio synthesis and scheduling.

## Features

- **Mode and chord exploration** – switch between chord and scale modes, choose a key, and browse available musical systems.
- **Western and Maqam systems** – select from Western modes or quarter-tone maqam modes with microtonal intervals.
- **Instrument playback** – preview chords or scales using built-in synth sounds (piano, guitar, bass, flute) powered by Tone.js.
- **Sequencer & pattern library** – sketch drum grooves or chord progressions with a step sequencer and load/save reusable patterns.
- **Instrument visualizations** – see highlighted notes on a piano keyboard, guitar/bass/violin fretboards, or koto strings.
- **MIDI export** – generate and copy simple MIDI data for further use in a DAW.

## Sequencer

The built-in sequencer provides a piano-roll editor for arranging tracks. Each track can host a synth or drum instrument. Patterns from the library can be inserted and edited, while transport controls support looping, quantization, and rendering to WAV/MP3 via Tone.js.

### Pattern Library

Drum and chord patterns are defined as arrays of note events (`tick`, `dur`, `midi`, `vel`). Users can extend the library and save custom patterns in `localStorage` for later sessions.

## Keyboard Shortcuts

- Press **Spacebar** to play or pause the sequencer.
- See the in-app shortcuts modal for the full list of available shortcuts.

## Instrument Visualizations

Interactive views highlight playable notes for the selected chord or scale:

- **Piano** – on-screen keyboard with root and chord tones color‑coded.
- **Fretboards** – 12‑fret guitar, bass, and violin layouts show finger positions.
- **Koto** – string board representation useful for modal exploration.

## Architecture

All functionality lives in a single HTML file using vanilla JavaScript. Tone.js supplies the audio engine, synth voices, and timing grid. UI components rely on Tailwind utility classes, and instrument widgets are drawn procedurally with the Canvas API, avoiding binary assets.

## How it works

Key musical concepts are captured in simple data structures:

- `KEYS` – array of note names used to populate key selectors.
- `MODES` – mapping of mode names to interval patterns for scale generation.
- `CHORD_QUALITIES` – intervals that define chord formulas.
- `PATTERN_LIBRARY` – default sequencer patterns expressed as MIDI events.

## Usage and Contribution

Open the `chord_scale_library_html_tailwind_tone.html` file in a modern browser to experiment with chords, scales, and microtonal modes. This framework is released for anyone to use, modify, and expand without restriction. Contributions and new ideas are welcome.
