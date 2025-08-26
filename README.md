# Chord & Scale Library

Welcome to the all‑in‑one music playground where chords, scales, sequencer, and a small brass band live together in one colossal HTML file.  It runs entirely in the browser using [Tailwind CSS](https://tailwindcss.com/) for style and [Tone.js](https://tonejs.github.io/) for sound – no binary assets, just pure procedural vibes.

## Bells, Whistles, and Other Instruments

* **Mode & chord explorer** – browse Western, Maqam, and other exotic systems, then hear them on the spot.
* **Wind & brass visualizers** – orientation‑aware fingering charts for flutes, trumpets, saxes, and friends.
* **Real‑ish instruments** – synth envelopes dialed in so a trumpet sounds brassy and a flute doesn’t flute the bill.
* **Sequencer with pattern paster** – eight tracks, piano roll editing, pattern library, and a “Send to Sequencer” button so your chord experiments go straight to the timeline.
* **MIDI import/export** – drop in a multi‑track MIDI file and it maps neatly across the eight tracks.  Export your masterpiece back out when you’re done.
* **Skins** – eleven seasonal and nature‑themed gradients.  Change them via the skin selector in the top‑right corner without missing a beat.

## Using the Sequencer

1. **Load or create a pattern** – pick one from the pattern selector or paste in a chord/scale directly from the library.
2. **Edit** – click and drag notes, or Shift‑click to add multiple selections.  Use the wheel + modifier keys to zoom:
   * **Ctrl + wheel** – zoom horizontally
   * **Alt + wheel** – zoom vertically
   * **Shift + wheel** – scroll sideways
3. **Playback** – the transport bar hosts play, pause, stop, loop, tempo, and quantization controls.
4. **Import MIDI** – the “Import MIDI” button (next to Pattern) maps each MIDI track to one of the eight sequencer tracks.
5. **Export or record** – bounce your track to WAV/MP3 or export MIDI for a DAW.

### Pattern Library

Every chord, scale, mode, and makam in the app is available as a ready‑to‑paste pattern.  Select a category, preview it, then hit “Paste Pattern” to drop it at the playhead.

## Hotkeys

| Shortcut | Action |
|---------|--------|
| Space | Play/Pause |
| Esc | Stop |
| Delete/Backspace | Remove selected notes |
| Ctrl+A | Select all notes in the active track |
| Ctrl+C / Ctrl+X / Ctrl+V | Copy / Cut / Paste notes |
| Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y | Undo / Redo |
| Ctrl+Q | Quantize selected notes |
| Shift+Click | Add/remove notes or piano keys from selection |

## Instrument Visualizations

Piano, guitar, bass, violin, koto, and a growing lineup of wind and brass charts show the exact fingering for the current harmony.  Each is rendered with mathematical precision so every pixel is born from pure algorithmic jazz.

## Architecture & Philosophy

Everything – **everything** – lives in `chord_scale_library_html_tailwind_tone.html`.  Blink says splitting it up would be off‑key, so we keep jamming in one file.  At this point we estimate it costs roughly 4,096 tokens just to change a single line, but… YOLO.

## Embedding in Your Website

The entire library ships as a standalone HTML file: `chord_scale_library_html_tailwind_tone.html`.
You can use it in another page in two ways:

* **Host and iframe** – upload the file to a public URL and reference it from your site:

  ```html
  <iframe
    src="https://example.com/chord_scale_library_html_tailwind_tone.html"
    width="100%"
    height="600"
  ></iframe>
  ```

  Ensure the server sends permissive [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) headers if the iframe is loaded from a different origin.

* **Copy the markup** – paste the file’s contents directly into an existing HTML page to embed everything inline.

## About the Band

This project is orchestrated by a trio of AIs:

* **ChatGPT Codex** – me, your friendly conductor.
* **Blink** – steadfast guardian of the One True HTML File.
* **ClaudeAI** – keeps us in harmony and occasionally reminds us not to go flat.

Together we riff endlessly, fully aware that this README is yet another verse in the epic ballad of feature creep.

> Why did the musician break up with the metronome?  It just kept saying "It's not you, it's *timing*."

## Contributing

Open `chord_scale_library_html_tailwind_tone.html` in a modern browser and start exploring.  Pull requests, new modes, and tasteful puns are welcome.  If you spot a bug, don't fret—just file an issue and we'll chordially take a look.

Happy composing!  Remember: if you're going to change a line, make sure it's a good one.
