import { pcIndex, pcName, OCTAVE, PITCH_STEP, mod } from './notes.js';

export const CHORD_QUALITIES = {
  Maj:[0,4,7], Min:[0,3,7], Dim:[0,3,6], Aug:[0,4,8],
  Sus2:[0,2,7], Sus4:[0,5,7],
  "7":[0,4,7,10], Maj7:[0,4,7,11], Min7:[0,3,7,10],
  m7b5:[0,3,6,10], Dim7:[0,3,6,9],
  "9":[0,4,7,10,14], Maj9:[0,4,7,11,14], Min9:[0,3,7,10,14],
  "11":[0,4,7,10,14,17], Maj11:[0,4,7,11,14,17], Min11:[0,3,7,10,14,17],
  "13":[0,4,7,10,14,17,21], Maj13:[0,4,7,11,14,17,21], Min13:[0,3,7,10,14,17,21],
  "7b5":[0,4,6,10], "7#5":[0,4,8,10],
  "7b9":[0,4,7,10,13], "7#9":[0,4,7,10,15],
  "7#11":[0,4,7,10,18], "7b13":[0,4,7,10,20]
};

export function buildChord(root, quality) { 
  const rootPc = pcIndex(root); 
  const pattern = CHORD_QUALITIES[quality] || CHORD_QUALITIES.Maj; 
  if(rootPc == null) return []; 
  return pattern.map(iv => pcName(rootPc + iv)); 
}

export async function chordToMidi(notes, root, baseOct = 4) {
  const { midiFrom } = await import('./notes.js');
  const rootMidi = midiFrom(root, baseOct);
  if(rootMidi == null) return [];
  
  const rootPc = pcIndex(root);
  if(rootPc == null) return [];
  
  const pcs = notes.map(pcIndex).filter(x => x != null);
  const ordered = pcs.map(pc => {
    let best = rootMidi - mod(rootPc - pc, OCTAVE);
    while(best < rootMidi - 5) best += OCTAVE;
    while(best > rootMidi + OCTAVE) best -= OCTAVE;
    return best;
  }).sort((a, b) => a - b);
  
  return Array.from(new Set(ordered));
}

// Identify chord from selection
const CHORD_DICT = CHORD_QUALITIES; // reuse

export function eqArr(a, b) { 
  return a.length === b.length && a.every((v, i) => v === b[i]); 
}

export function intersection(a, b) { 
  return a.filter(x => b.includes(x)); 
}

export function invOf(midiNotes, rootPc) { 
  const bass = Math.min(...midiNotes); 
  const d = mod((bass % OCTAVE) - rootPc, OCTAVE); 
  if(Math.abs(d) < PITCH_STEP / 2) return "root position"; 
  if(Math.abs(d - 3) < PITCH_STEP / 2 || Math.abs(d - 4) < PITCH_STEP / 2) return "1st inv"; 
  if(Math.abs(d - 7) < PITCH_STEP / 2 || Math.abs(d - 8) < PITCH_STEP / 2 || Math.abs(d - 6) < PITCH_STEP / 2) return "2nd inv"; 
  return "inversion"; 
}

export function chordNameFromNotes(midiNotes) { 
  if(!midiNotes.length) return {name: "—", detail: ""}; 
  
  const pcs = [...new Set(midiNotes.map(n => mod(n, OCTAVE)))].sort((a, b) => a - b); 
  let best = null; 
  
  for(const root of pcs) {
    const trans = pcs.map(pc => mod(pc - root, OCTAVE)).sort((a, b) => a - b); 
    for(const [qual, pat] of Object.entries(CHORD_DICT)) {
      const reduced = [...new Set(pat.map(x => mod(x, OCTAVE)))].sort((a, b) => a - b); 
      const score = intersection(trans, reduced).length; 
      const exact = eqArr(trans, reduced); 
      if(!best || exact || score > best.score) {
        best = {
          score, 
          name: pcName(root) + " " + qual, 
          root, 
          inv: invOf(midiNotes, root), 
          exact
        }; 
        if(exact) return {...best, detail: best.inv ? `(${best.inv})` : ""}; 
      } 
    } 
  } 
  return best ? {...best, detail: (best.inv ? `(${best.inv}) ` : "") + "~approx"} : {name: "?", detail: ""}; 
}
