import './styles.css';

// Register a minimal service worker (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Minimal shell: top transport + left sidebar + content slot
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="h-full w-full grid" style="grid-template-rows: 56px 1fr; grid-template-columns: 72px 1fr;">
    <header class="col-span-2 row-start-1 flex items-center justify-between px-4 glass shadow-subtle">
      <div class="flex items-center gap-3">
        <button id="t-play" class="focus-ring rounded-md px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium" aria-label="Play">Play</button>
        <button id="t-pause" class="focus-ring rounded-md px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm" aria-label="Pause">Pause</button>
        <button id="t-stop" class="focus-ring rounded-md px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm" aria-label="Stop">Stop</button>
        <div class="ml-4 flex items-center gap-2 text-sm">
          <label class="opacity-80">BPM</label>
          <input id="t-bpm" type="number" value="120" class="w-20 bg-transparent border border-slate-600 rounded px-2 py-1" />
          <label class="opacity-80">TS</label>
          <input id="t-tsn" type="number" value="4" class="w-14 bg-transparent border border-slate-600 rounded px-2 py-1" />/
          <input id="t-tsd" type="number" value="4" class="w-14 bg-transparent border border-slate-600 rounded px-2 py-1" />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <select id="t-theme" class="bg-transparent border border-slate-600 rounded px-2 py-1 text-sm">
          <option value="default">Default</option>
          <option value="solarized">Solarized</option>
          <option value="mono">Mono</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="autumn">Autumn</option>
          <option value="winter">Winter</option>
          <option value="forest">Forest</option>
          <option value="ocean">Ocean</option>
          <option value="desert">Desert</option>
          <option value="mountain">Mountain</option>
          <option value="sunrise">Sunrise</option>
          <option value="sunset">Sunset</option>
        </select>
        <button id="t-cmd" class="focus-ring rounded-md px-2 py-1 border border-slate-600 text-sm">Ctrl/Cmd+K</button>
      </div>
    </header>
    <aside class="row-start-2 col-start-1 glass border-r border-slate-700 p-2 text-sm">
      <nav class="flex flex-col gap-2">
        <button class="focus-ring rounded px-2 py-1 hover:bg-slate-700 text-left" data-action="mode-chord">Chord</button>
        <button class="focus-ring rounded px-2 py-1 hover:bg-slate-700 text-left" data-action="mode-scale">Scale/Mode</button>
        <button class="focus-ring rounded px-2 py-1 hover:bg-slate-700 text-left" data-action="mode-seq">Sequencer</button>
      </nav>
    </aside>
    <main class="row-start-2 col-start-2 p-4 overflow-auto">
      <div class="opacity-80 text-sm">This shell is ready to host the modular UI. Hook it up to your sequencer engine and panels here.</div>
    </main>

    <div id="toasts" class="fixed bottom-3 right-3 flex flex-col gap-2 z-50"></div>
    <div id="cmdp" class="fixed inset-0 hidden items-start justify-center bg-black/50 z-50">
      <div class="mt-24 w-[600px] rounded-xl glass border border-slate-700 shadow-card">
        <input id="cmdp-input" placeholder="Type a command..." class="w-full bg-transparent px-4 py-3 border-b border-slate-700 outline-none" />
        <div id="cmdp-list" class="max-h-80 overflow-auto">
        </div>
      </div>
    </div>
  </div>
`;

type Command = { id: string; label: string; run: () => void };
const commands: Command[] = [
  { id: 'play', label: 'Transport: Play', run: () => click('#seqPlay') },
  { id: 'pause', label: 'Transport: Pause', run: () => click('#seqPause') },
  { id: 'stop', label: 'Transport: Stop', run: () => click('#seqStop') },
  { id: 'quantize', label: 'Notes: Quantize Selected', run: () => click('#seqQuantizeBtn') },
  { id: 'export-json', label: 'Export: Song JSON', run: () => click('#seqExportJson') },
  { id: 'export-midi', label: 'Export: MIDI', run: () => click('#seqExportMid') },
];

function click(sel: string) {
  const el = document.querySelector<HTMLButtonElement>(sel);
  el?.click();
}

// Toasts
function showToast(text: string) {
  const wrap = document.getElementById('toasts')!;
  const item = document.createElement('div');
  item.className = 'rounded-lg glass border border-slate-700 px-3 py-2 text-sm shadow-subtle';
  item.textContent = text;
  wrap.appendChild(item);
  setTimeout(() => item.remove(), 2500);
}

// Mirror theme with legacy skin and persist
const themeSel = document.getElementById('t-theme') as HTMLSelectElement;
themeSel.value = localStorage.getItem('skin') || 'default';
themeSel.addEventListener('change', () => {
  localStorage.setItem('skin', themeSel.value);
  const skin = document.getElementById('skinSelector') as HTMLSelectElement | null;
  if (skin) { skin.value = themeSel.value; skin.dispatchEvent(new Event('change', { bubbles: true })); }
});

// Command palette
const cmdBtn = document.getElementById('t-cmd')!;
const cmdp = document.getElementById('cmdp')!;
const cmdInput = document.getElementById('cmdp-input') as HTMLInputElement;
const cmdList = document.getElementById('cmdp-list')!;

function openCmdp() {
  cmdp.classList.remove('hidden');
  cmdInput.value = '';
  renderCmds('');
  cmdInput.focus();
}
function closeCmdp() { cmdp.classList.add('hidden'); }
cmdBtn.addEventListener('click', openCmdp);

window.addEventListener('keydown', (e) => {
  const isMac = navigator.platform.includes('Mac');
  if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCmdp();
  }
  if (e.key === 'Escape' && !cmdp.classList.contains('hidden')) closeCmdp();
  if (e.key === ' ') { e.preventDefault(); click('#seqPlay'); }
  if (e.key.toLowerCase() === 's') { e.preventDefault(); click('#seqStop'); }
  if (e.key.toLowerCase() === 'q') { e.preventDefault(); click('#seqQuantizeBtn'); }
  if (e.key === '+') { document.getElementById('seqZoomX')?.dispatchEvent(new InputEvent('input', { bubbles: true })); }
});

cmdInput.addEventListener('input', () => renderCmds(cmdInput.value));
function renderCmds(q: string) {
  const items = commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
  cmdList.innerHTML = '';
  for (const c of items) {
    const row = document.createElement('button');
    row.className = 'w-full text-left px-4 py-2 hover:bg-slate-700';
    row.textContent = c.label;
    row.addEventListener('click', () => { c.run(); closeCmdp(); showToast(c.label); });
    cmdList.appendChild(row);
  }
}

// Proxy transport inputs -> legacy controls if present
document.getElementById('t-play')!.addEventListener('click', () => click('#seqPlay'));
document.getElementById('t-pause')!.addEventListener('click', () => click('#seqPause'));
document.getElementById('t-stop')!.addEventListener('click', () => click('#seqStop'));
(document.getElementById('t-bpm') as HTMLInputElement).addEventListener('change', (e) => {
  const val = (e.target as HTMLInputElement).value;
  const bpm = document.getElementById('seqBpm') as HTMLInputElement | null;
  if (bpm) { bpm.value = val; bpm.dispatchEvent(new Event('input', { bubbles: true })); }
});

// Show toasts when legacy status text changes
const status = document.getElementById('seqStatus');
if (status) {
  const mo = new MutationObserver(() => {
    const text = status.textContent?.trim();
    if (text) showToast(text);
  });
  mo.observe(status, { childList: true, subtree: true, characterData: true });
}
