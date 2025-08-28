import { createEngine } from '../engine/transport';
import type { Song } from '../engine/types';

export function mountSequencerPanel(container: HTMLElement) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'space-y-3';

  const controls = document.createElement('div');
  controls.className = 'flex flex-wrap gap-2 items-center';
  const play = btn('Play', 'bg-emerald-600');
  const pause = btn('Pause', 'bg-yellow-600');
  const stop = btn('Stop', 'bg-rose-600');
  const bpm = input('number', '120'); bpm.classList.add('w-24');
  controls.append(play, pause, stop, label('BPM', bpm));

  const canvas = document.createElement('canvas');
  canvas.className = 'w-full h-64 bg-slate-900 border border-slate-700 rounded-md';
  const mini = document.createElement('canvas');
  mini.className = 'w-full h-10 bg-slate-900 border border-slate-700 rounded-md';

  // Add timeline
  const timeline = document.createElement('div');
  timeline.className = 'flex items-center gap-2 text-sm text-slate-400';
  const timeDisplay = document.createElement('span');
  timeDisplay.textContent = '0:00';
  timeline.appendChild(timeDisplay);

  wrap.append(controls, canvas, mini, timeline);
  container.appendChild(wrap);

  const eng = createEngine();
  const song: Song = {
    ppq: 96,
    bpm: 120,
    ts: { num: 4, den: 4 },
    loop: { enabled: false, start: 0, end: 96 * 16 },
    tracks: [
      {
        id: 't1', name: 'Piano', instrument: 'Piano', volume: 0.8, clips: [
          { id: 'c1', start: 0, notes: [
            { midi: 60, tick: 0, dur: 24 },
            { midi: 64, tick: 24, dur: 24 },
            { midi: 67, tick: 48, dur: 24 },
            { midi: 72, tick: 72, dur: 24 },
          ]}
        ]
      }
    ]
  };
  eng.load(song);

  play.addEventListener('click', () => eng.play());
  pause.addEventListener('click', () => eng.pause());
  stop.addEventListener('click', () => eng.stop());
  bpm.addEventListener('change', () => eng.setBpm(parseFloat((bpm as HTMLInputElement).value || '120')));

  // Enhanced drawing functions
  const ctx = canvas.getContext('2d')!;
  const mctx = mini.getContext('2d')!;
  
  function size() {
    canvas.width = canvas.clientWidth; 
    canvas.height = canvas.clientHeight;
    mini.width = mini.clientWidth; 
    mini.height = mini.clientHeight;
  }
  
  function drawGrid() {
    size();
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0b1220'; 
    ctx.fillRect(0,0,W,H);
    
    // Bars and beats
    const bars = 16; 
    const beatsPerBar = song.ts.num;
    const ticksPerBar = song.ppq * beatsPerBar;
    
    for (let bar = 0; bar <= bars; bar++){
      const x = Math.round((bar / bars) * W);
      ctx.strokeStyle = bar % 2 === 0 ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)';
      ctx.lineWidth = bar % 2 === 0 ? 2 : 1;
      ctx.beginPath(); 
      ctx.moveTo(x+0.5, 0); 
      ctx.lineTo(x+0.5, H); 
      ctx.stroke();
      
      if (bar < bars) {
        for (let b=1; b<beatsPerBar; b++){
          const xb = x + Math.round((b / beatsPerBar) * (W / bars));
          ctx.strokeStyle = 'rgba(255,255,255,.06)';
          ctx.lineWidth = 1;
          ctx.beginPath(); 
          ctx.moveTo(xb+0.5, 0); 
          ctx.lineTo(xb+0.5, H); 
          ctx.stroke();
        }
      }
    }
    
    // Draw notes
    drawNotes();
  }
  
  function drawNotes() {
    const W = canvas.width, H = canvas.height;
    const bars = 16;
    const ticksPerBar = song.ppq * song.ts.num;
    const totalTicks = bars * ticksPerBar;
    
    // Note colors
    const noteColors = ['#4ab0ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    song.tracks.forEach((track, trackIndex) => {
      track.clips.forEach(clip => {
        clip.notes.forEach(note => {
          const startX = (clip.start + note.tick) / totalTicks * W;
          const width = note.dur / totalTicks * W;
          const noteHeight = 20;
          const y = 50 + trackIndex * 30;
          
          // Note rectangle
          ctx.fillStyle = noteColors[trackIndex % noteColors.length];
          ctx.fillRect(startX, y, Math.max(width, 2), noteHeight);
          
          // Note border
          ctx.strokeStyle = '#1e9bff';
          ctx.lineWidth = 1;
          ctx.strokeRect(startX, y, Math.max(width, 2), noteHeight);
          
          // Note label
          const noteName = getNoteName(note.midi);
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(noteName, startX + width/2, y + noteHeight/2 + 3);
        });
      });
    });
  }
  
  function getNoteName(midi: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[midi % 12];
  }
  
  function drawMinimap() {
    mctx.clearRect(0,0,mini.width, mini.height);
    mctx.fillStyle = '#0b1220'; 
    mctx.fillRect(0,0,mini.width, mini.height);
    
    // Background pattern
    mctx.fillStyle = 'rgba(99,102,241,.25)'; 
    mctx.fillRect(0,0,mini.width, mini.height);
    
    // Current position indicator
    mctx.fillStyle = 'rgba(34,197,94,.6)'; 
    mctx.fillRect(0,2, mini.width/4, mini.height-4);
    mctx.strokeStyle = 'rgba(34,197,94,.9)'; 
    mctx.strokeRect(0.5,1.5, mini.width/4-1, mini.height-3);
  }
  
  const ro = new ResizeObserver(() => {
    drawGrid();
    drawMinimap();
  }); 
  ro.observe(canvas); 
  ro.observe(mini);
  
  // Initial draw
  setTimeout(() => {
    drawGrid();
    drawMinimap();
  }, 200);
}

function btn(label: string, color: string){ const b=document.createElement('button'); b.className=`px-3 py-2 rounded-md ${color} hover:opacity-90 text-white text-sm`; b.textContent=label; return b; }
function input(type: string, val: string){ const i=document.createElement('input'); i.type=type; (i as HTMLInputElement).value=val; i.className='focus-ring rounded-md px-3 py-2 border border-slate-600 bg-transparent text-sm'; return i; }
function label(text: string, el: HTMLElement){ const w=document.createElement('label'); w.className='flex items-center gap-2 text-sm'; w.textContent=text; w.appendChild(el); return w; }

