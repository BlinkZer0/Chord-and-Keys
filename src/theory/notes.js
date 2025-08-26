// Quarter‑tone pitch map (0.5‑semitone steps = 24 pitch classes)
export const NOTES_SHARP = [
  "C","C+","C#","C#+","D","D+","D#","D#+",
  "E","E+","F","F+","F#","F#+","G","G+",
  "G#","G#+","A","A+","A#","A#+","B","B+"
];

export const PITCH_STEP = 0.5; // smallest interval in semitones
export const OCTAVE = 12;      // semitones per octave

export const ENHARMONIC_MAP = {
  "Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#",
  "Bb":"A#","E#":"F","B#":"C","Fb":"E","Cb":"B"
};

export const KEYS = [
  "C","C#","Db","D","D#","Eb","E","F",
  "F#","Gb","G","G#","Ab","A","A#","Bb","B"
];

export function toSharpName(n) { 
  return ENHARMONIC_MAP[n] || n; 
}

export function pcIndex(note) {
  const n = String(note).trim();
  const m = n.match(/^([A-G])([#b+-]*)/);
  if(!m) return null;
  
  const BASE = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
  let val = BASE[m[1]];
  
  for(const ch of (m[2] || "")) {
    if(ch === "#") val += 1;
    else if(ch === "b") val -= 1;
    else if(ch === "+") val += PITCH_STEP;
    else if(ch === "-") val -= PITCH_STEP;
  }
  return val;
}

export function pcName(i) {
  const norm = ((i % OCTAVE) + OCTAVE) % OCTAVE;
  const idx = Math.round(norm / PITCH_STEP) % NOTES_SHARP.length;
  return NOTES_SHARP[idx];
}

export function midiFrom(note, octave = 4) {
  const i = pcIndex(note);
  if(i == null) return null;
  return OCTAVE * (octave + 1) + i;
}

export function mod(n, m) { 
  return ((n % m) + m) % m; 
}
