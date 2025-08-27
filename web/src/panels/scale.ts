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

  wrap.append(header, controls, out);
  container.appendChild(wrap);

  function render(){
    const root = (rootSel as any).value as string;
    const mode = MODES.find(m => m.value === (modeSel as any).value)!;
    const midiRoot = 60 + ROOTS.indexOf(root);
    const scale = mode.intervals.map(i => midiRoot + i);
    out.textContent = `${root} ${mode.label}: [${scale.join(', ')}]`;
  }
  render();
}

