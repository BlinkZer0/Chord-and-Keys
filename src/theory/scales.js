import { pcIndex, pcName, OCTAVE } from './notes.js';

// Modes and scales. Quarter‑tone maqam patterns based on MaqamWorld theory (https://www.maqamworld.com/)
export const MODES = {
  Ionian: [0,2,4,5,7,9,11],
  Dorian: [0,2,3,5,7,9,10],
  Phrygian: [0,1,3,5,7,8,10],
  Lydian: [0,2,4,6,7,9,11],
  Mixolydian: [0,2,4,5,7,9,10],
  Aeolian: [0,2,3,5,7,8,10],
  Locrian: [0,1,3,5,6,8,10],
  "Major Pentatonic": [0,2,4,7,9],
  "Minor Pentatonic": [0,3,5,7,10],
  Blues: [0,3,5,6,7,10],
  "Harmonic Minor": [0,2,3,5,7,8,11],
  "Melodic Minor (Asc)": [0,2,3,5,7,9,11],
  "Melodic Minor (Desc)": [0,2,3,5,7,8,10],
  "Whole Tone": [0,2,4,6,8,10],
  "Diminished (Half-Whole)": [0,1,3,4,6,7,9,10],
  "Diminished (Whole-Half)": [0,2,3,5,6,8,9,11],
  // Common maqamat using 24-TET intervals (0.5 = quarter-tone)
  "Maqam Rast": [0,2,3.5,5,7,9,10.5],      // Rast: E half-flat, B half-flat
  "Maqam Bayati": [0,1.5,3,5,7,8.5,10],    // Bayati: D half-flat, B half-flat
  "Maqam Hijaz": [0,1,4,5,7,8,11],         // Hijaz: augmented second between 2nd & 3rd
  "Maqam Saba": [0,1.5,3,4.5,7,8.5,10],    // Saba: D & F half-flat
  "Maqam Nahawand": [0,2,3,5,7,8,10],       // Nahawand: natural minor
  "Maqam Kurd": [0,1,3,5,7,8,10],          // Kurd: Phrygian base
  "Maqam Huzam": [0,1.5,4,5,7,8.5,10],     // Huzam: tonic half-flat, sixth half-flat
  "Maqam Hijazkar": [0,1,4,6,7,8,11]       // Hijazkar: raised fourth
};

// Group modes by musical system for UI filtering
export const MODE_SYSTEMS = {
  Western: [
    "Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian",
    "Major Pentatonic","Minor Pentatonic","Blues","Harmonic Minor",
    "Melodic Minor (Asc)","Melodic Minor (Desc)","Whole Tone",
    "Diminished (Half-Whole)","Diminished (Whole-Half)"
  ],
  Maqam: [
    "Maqam Rast","Maqam Bayati","Maqam Hijaz","Maqam Saba","Maqam Nahawand",
    "Maqam Kurd","Maqam Huzam","Maqam Hijazkar"
  ]
};

export function buildScale(tonic, modeName) { 
  const rootPc = pcIndex(tonic); 
  const pattern = MODES[modeName] || MODES.Ionian; 
  if(rootPc == null) return []; 
  return pattern.map(iv => pcName(rootPc + iv)); 
}

export async function scaleToMidi(scaleNotes, tonic, startOct = 4) {
  const pcs = scaleNotes.map(pcIndex).filter(x => x != null);
  const tonicPc = pcIndex(tonic);
  if(tonicPc == null) return [];
  
  const seq = [];
  for(let o = startOct; o <= startOct + 1; o++) {
    for(const pc of pcs) { 
      seq.push(OCTAVE * (o + 1) + pc); 
    }
  }
  
  const startIdx = pcs.indexOf(tonicPc);
  if(startIdx > 0) {
    const perOct = pcs.length;
    const out = [];
    for(let i = 0; i < seq.length; i += perOct) {
      const chunk = seq.slice(i, i + perOct);
      out.push(...chunk.slice(startIdx), ...chunk.slice(0, startIdx));
    }
    return out;
  }
  return seq;
}
