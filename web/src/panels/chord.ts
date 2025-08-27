import { createA11ySelect } from '../components/a11ySelect';

const ROOTS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const QUALITIES = [
  { value: 'maj', label: 'Major' },
  { value: 'min', label: 'Minor' },
  { value: 'dim', label: 'Diminished' },
  { value: 'aug', label: 'Augmented' },
  { value: '7', label: 'Dominant 7' },
  { value: 'maj7', label: 'Major 7' },
  { value: 'min7', label: 'Minor 7' }
];

function chordIntervals(q: string): number[] {
  switch(q){
    case 'maj': return [0,4,7];
    case 'min': return [0,3,7];
    case 'dim': return [0,3,6];
    case 'aug': return [0,4,8];
    case '7': return [0,4,7,10];
    case 'maj7': return [0,4,7,11];
    case 'min7': return [0,3,7,10];
    default: return [0,4,7];
  }
}

export function mountChordPanel(container: HTMLElement) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'space-y-4';

  const header = document.createElement('div');
  header.className = 'text-lg font-semibold';
  header.textContent = 'Chord Builder';

  const controls = document.createElement('div');
  controls.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3';
  const rootMount = document.createElement('div');
  const qualMount = document.createElement('div');
  const invMount = document.createElement('div');
  controls.append(rootMount, qualMount, invMount);

  const rootSel = createA11ySelect(
    rootMount,
    ROOTS.map(r => ({ value: r, label: r })),
    () => render()
  );

  const qualSel = createA11ySelect(
    qualMount,
    QUALITIES,
    () => render(),
    'maj'
  );

  const invInput = document.createElement('input');
  invInput.type = 'number'; invInput.min = '0'; invInput.max = '3'; invInput.value = '0';
  invInput.className = 'focus-ring rounded-md px-3 py-2 border border-slate-600 bg-transparent text-sm w-full';
  invMount.appendChild(invInput);

  const out = document.createElement('div');
  out.className = 'rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm';

  const actions = document.createElement('div');
  actions.className = 'flex gap-2';
  const sendBtn = document.createElement('button');
  sendBtn.className = 'px-3 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-sm';
  sendBtn.textContent = 'Send to Sequencer';
  actions.appendChild(sendBtn);

  wrap.append(header, controls, out, actions);
  container.appendChild(wrap);

  function render(){
    const root = (rootSel as any).value as string;
    const q = (qualSel as any).value as string;
    const inv = parseInt(invInput.value || '0', 10) || 0;
    const rootIndex = ROOTS.indexOf(root);
    const midiRoot = 60 + rootIndex; // C4 based
    const ints = chordIntervals(q);
    const notes = ints.map(semi => midiRoot + semi);
    // apply inversion
    for(let i=0;i<inv;i++){ const n = notes.shift()!; notes.push(n+12); }
    out.textContent = `${root}${q==='maj'?'':q}: [${notes.join(', ')}]`;
  }
  invInput.addEventListener('input', render);
  render();
}

