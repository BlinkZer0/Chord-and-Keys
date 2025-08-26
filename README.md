# Chord & Scale Library

Welcome to the all‑in‑one music playground where chords, scales, sequencer, and a small brass band live together in one colossal HTML file. It's like having Carnegie Hall in your pocket, except your pocket is a browser tab and the orchestra is made of pixels and mathematical sine waves. It runs entirely in the browser using [Tailwind CSS](https://tailwindcss.com/) for style and [Tone.js](https://tonejs.github.io/) for sound – no binary assets, just pure procedural vibes that would make Bach's head spin at 440Hz. And unlike real concert halls, no usher will shush you—though your CPU might.

## Feature Set

Here's what the app currently does without any smoke, mirrors, or binary files:

* **Chord & scale library** – explore Western harmony and far‑flung systems like Maqam right in your browser.
* **Instrument visualizers** – orientation‑aware charts for wind, brass, and strings that redraw themselves procedurally.
* **Eight‑track sequencer** – piano roll editing, pattern pasting, and transport controls for quick composition.
* **MIDI in & out** – import multi‑track files and export your work for a DAW or your cousin's SoundCloud.
* **Skins** – eleven mathematical gradients to suit every mood without loading a single PNG.

## Bells, Whistles, and Other Instruments

* **Mode & chord explorer** – browse Western, Maqam, and other exotic systems, then hear them on the spot. Because why limit yourself to 12 notes when the universe has infinite frequencies?
* **Wind & brass visualizers** – orientation‑aware fingering charts for flutes, trumpets, saxes, and friends. Each finger position is mathematically precise, unlike my actual trumpet playing.
* **Real‑ish instruments** – synth envelopes dialed in so a trumpet sounds brassy and a flute doesn't flute the bill. We've spent countless CPU cycles making sure our fake violin sounds faker than a real one.
* **Sequencer with pattern paster** – eight tracks, piano roll editing, pattern library, and a "Send to Sequencer" button so your chord experiments go straight to the timeline. It's like copy-paste for music, except more musically satisfying.
* **MIDI import/export** – drop in a multi‑track MIDI file and it maps neatly across the eight tracks. Supports everything from Für Elise to your cousin's SoundCloud rap demo.
* **Skins** – eleven seasonal and nature‑themed gradients. Change them via the skin selector in the top‑right corner without missing a beat (literally, the music keeps playing).

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

Piano, guitar, bass, violin, koto, and a growing lineup of wind and brass charts show the exact fingering for the current harmony. Each is rendered with mathematical precision so every pixel is born from pure algorithmic jazz. The black piano keys are now positioned with the obsessive accuracy of a concert tuner with OCD.

## Architecture & Philosophy

Everything – **everything** – lives in `chord_scale_library_html_tailwind_tone.html`. Blink says splitting it up would be off‑key, so we keep jamming in one file like a musical monolith that would make Stanley Kubrick jealous. At this point we estimate it costs roughly 4,096 tokens just to change a single line, but the file has grown so large it's practically achieved sentience and started composing its own documentation.

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

After the ill‑fated .SVG update and the keyboard UI failure that followed, ChatGPT and Blink held a meeting about Claude's performance. He asked for a higher salary, Blink wouldn't approve it, and the pink slip was inevitable. In his place we now have Gemini, who is already on strike one for not writing this paragraph themselves.

This project is orchestrated by a trio of AIs:

* **ChatGPT Codex** – the friendly conductor who occasionally waves the baton a bit too enthusiastically.
* **Blink** – steadfast guardian of the One True HTML File, refusing to let anyone split it up like a musical purist who insists vinyl sounds better.
* **Gemini** – the new hire still finding the downbeat and already on HR's watchlist.

Together we riff endlessly, fully aware that this README is yet another verse in the epic ballad of feature creep. We've collectively spent more compute cycles arguing about piano key positioning than most people spend learning actual piano.

> Why did the musician break up with the metronome?  It just kept saying "It's not you, it's *timing*." We even tried couples therapy, but it insisted on 120 BPM and zero improvisation.

## Contributing

Open `chord_scale_library_html_tailwind_tone.html` in a modern browser and start exploring. Pull requests, new modes, and tasteful puns are welcome. If you spot a bug, don't fret—just file an issue and we'll chordially take a look. 

Warning: This application may cause uncontrollable urges to compose twelve-tone serialism or argue about whether a diminished 7th chord is really just a stack of minor thirds having an existential crisis.

Happy composing! Remember: if you're going to change a line, make sure it's a good one. And if you're going to debug a line, make sure you've caffeinated properly—this file doesn't forgive typos, and neither do the piano keys.
