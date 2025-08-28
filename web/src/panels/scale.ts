import { createA11ySelect } from '../components/a11ySelect';

const ROOTS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const MODES = [
  { value: 'ionian', label: 'Ionian (Major)', intervals: [0,2,4,5,7,9,11] },
  { value: 'dorian', label: 'Dorian', intervals: [0,2,3,5,7,9,10] },
  { value: 'phrygian', label: 'Phrygian', intervals: [0,1,3,5,7,8,10] },
  { value: 'lydian', label: 'Lydian', intervals: [0,2,4,6,7,9,11] },
  { value: 'mixolydian', label: 'Mixolydian', intervals: [0,2,4,5,7,9,10] },
  { value: 'aeolian', label: 'Aeolian (Minor)', intervals: [0,2,3,5,7,8,10] },
  { value: 'locrian', label: 'Locrian', intervals: [0,1,3,5,6,8,10] },
];

function createScaleVisualization(container: HTMLElement, scaleNotes: number[], rootNote: string) {
  container.innerHTML = '';
  
  const scaleContainer = document.createElement('div');
  scaleContainer.className = 'space-y-4';
  
  // Create piano keyboard for scale
  const keyboard = document.createElement('div');
  keyboard.className = 'flex h-32 bg-slate-800 rounded-lg p-2 gap-1 relative';
  
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];
  
  // Create one octave of keys
  for (let i = 0; i < 7; i++) {
    const whiteKey = document.createElement('div');
    whiteKey.className = 'piano-key white flex-1 rounded-b-md flex items-end justify-center pb-2 text-xs font-medium';
    whiteKey.textContent = whiteKeys[i];
    
    // Map white keys to MIDI notes: C=60, D=62, E=64, F=65, G=67, A=69, B=71
    const whiteKeyMidi = [60, 62, 64, 65, 67, 69, 71];
    const midiNote = whiteKeyMidi[i];
    
    if (scaleNotes.includes(midiNote)) {
      whiteKey.classList.add('active');
    }
    
    keyboard.appendChild(whiteKey);
    
    // Add black key if it exists
    if (blackKeys[i] && blackKeys[i] !== '') {
      const blackKey = document.createElement('div');
      blackKey.className = 'piano-key black absolute w-8 h-20 rounded-b-md flex items-end justify-center pb-2 text-xs font-medium';
      blackKey.textContent = blackKeys[i];
      
      // Position black keys correctly
      const blackKeyPositions = [10, 24, 0, 38, 52, 66, 0]; // percentages
      if (blackKeyPositions[i] > 0) {
        blackKey.style.marginLeft = `${blackKeyPositions[i]}%`;
        blackKey.style.zIndex = '10';
        
        // Map black keys to MIDI notes: C#=61, D#=63, F#=66, G#=68, A#=70
        const blackKeyMidi = [61, 63, 0, 66, 68, 70, 0];
        const blackMidiNote = blackKeyMidi[i];
        if (scaleNotes.includes(blackMidiNote)) {
          blackKey.classList.add('active');
        }
        
        keyboard.appendChild(blackKey);
      }
    }
  }
  
  // Create scale pattern visualization
  const patternContainer = document.createElement('div');
  patternContainer.className = 'bg-slate-900 rounded-lg p-4';
  
  const patternTitle = document.createElement('h3');
  patternTitle.className = 'text-sm font-medium mb-3';
  patternTitle.textContent = 'Scale Pattern';
  
  const patternGrid = document.createElement('div');
  patternGrid.className = 'grid grid-cols-7 gap-1';
  
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const whiteKeyMidi = [60, 62, 64, 65, 67, 69, 71];
  noteNames.forEach((note, index) => {
    const noteCell = document.createElement('div');
    noteCell.className = 'aspect-square rounded flex items-center justify-center text-xs font-medium border';
    
    const midiNote = whiteKeyMidi[index];
    
    if (scaleNotes.includes(midiNote)) {
      noteCell.className += ' bg-brand-600 text-white border-brand-500';
      noteCell.textContent = note;
    } else {
      noteCell.className += ' bg-slate-800 text-slate-400 border-slate-700';
      noteCell.textContent = '·';
    }
    
    patternGrid.appendChild(noteCell);
  });
  
  patternContainer.append(patternTitle, patternGrid);
  
  scaleContainer.append(keyboard, patternContainer);
  container.appendChild(scaleContainer);
}

export function mountScalePanel(container: HTMLElement){
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'space-y-4';

  const header = document.createElement('div');
  header.className = 'text-lg font-semibold';
  header.textContent = 'Scale Explorer';

  const controls = document.createElement('div');
  controls.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
  const rootMount = document.createElement('div');
  const modeMount = document.createElement('div');
  controls.append(rootMount, modeMount);

  const rootSel = createA11ySelect(
    rootMount,
    ROOTS.map(r => ({ value: r, label: r })),
    () => render()
  );

  const modeSel = createA11ySelect(
    modeMount,
    MODES.map(m => ({ value: m.value, label: m.label })),
    () => render(),
    'ionian'
  );

  const out = document.createElement('div');
  out.className = 'rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm';

  const visualContainer = document.createElement('div');
  visualContainer.className = 'space-y-4';

  wrap.append(header, controls, out, visualContainer);
  container.appendChild(wrap);

  function render(){
    const root = (rootSel as any).value as string;
    const mode = MODES.find(m => m.value === (modeSel as any).value)!;
    const midiRoot = 60 + ROOTS.indexOf(root);
    const scale = mode.intervals.map(i => midiRoot + i);
    out.textContent = `${root} ${mode.label}: [${scale.join(', ')}]`;
    
    // Update scale visualization
    createScaleVisualization(visualContainer, scale, root);
  }
  render();
}

