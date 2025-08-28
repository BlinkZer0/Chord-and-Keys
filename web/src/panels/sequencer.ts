import { createEngine } from '../engine/transport';
import type { Song, NotePlayEvent } from '../engine/types';
import { ChannelRack } from '../components/channel-rack';

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

  // Add slide toggle button
  const slideToggle = btn('Toggle Slide', 'bg-purple-600');
  slideToggle.addEventListener('click', () => {
    // For demo purposes, toggle slide on the second note
    const track = song.tracks[0];
    if (track.clips[0].notes.length > 1) {
      const secondNote = track.clips[0].notes[1];
      secondNote.slide = !secondNote.slide;
      drawGrid(); // Redraw to show changes
    }
  });
  controls.appendChild(slideToggle);

  // Add particle effects controls
  const particleToggle = document.createElement('input');
  particleToggle.type = 'checkbox';
  particleToggle.id = 'particle-toggle';
  particleToggle.className = 'focus-ring rounded';
  
  const particleLabel = document.createElement('label');
  particleLabel.htmlFor = 'particle-toggle';
  particleLabel.className = 'text-sm text-slate-300 cursor-pointer';
  particleLabel.textContent = 'Particle Effects';
  
  const particleEffectSelect = document.createElement('select');
  particleEffectSelect.id = 'particle-effect';
  particleEffectSelect.className = 'focus-ring rounded-md px-2 py-1 border border-slate-600 bg-transparent text-sm';
  particleEffectSelect.disabled = true;
  
  const particleEffects = [
    'Sparkles',
    'Fireworks',
    'Rings',
    'Stars',
    'Bubbles',
    'Dust',
    'Lightning',
    'Smoke',
    'Energy',
    'Magic'
  ];
  
  particleEffects.forEach(effect => {
    const option = document.createElement('option');
    option.value = effect.toLowerCase();
    option.textContent = effect;
    particleEffectSelect.appendChild(option);
  });
  
  const particleContainer = document.createElement('div');
  particleContainer.className = 'flex items-center gap-2';
  particleContainer.appendChild(particleToggle);
  particleContainer.appendChild(particleLabel);
  particleContainer.appendChild(particleEffectSelect);
  
  controls.appendChild(particleContainer);

  // Create main layout
  const layout = document.createElement('div');
  layout.className = 'flex gap-4 h-full';

  // Left panel - Channel Rack
  const leftPanel = document.createElement('div');
  leftPanel.className = 'w-80 flex-shrink-0';
  
  // Channel rack container
  const channelRackContainer = document.createElement('div');
  channelRackContainer.className = 'h-full';

  // Right panel - Sequencer
  const rightPanel = document.createElement('div');
  rightPanel.className = 'flex-1 flex flex-col';

  const canvas = document.createElement('canvas');
  canvas.className = 'w-full h-96 bg-slate-900 border border-slate-700 rounded-md';
  const mini = document.createElement('canvas');
  mini.className = 'w-full h-10 bg-slate-900 border border-slate-700 rounded-md';

  // Add context menu for note editing
  const contextMenu = document.createElement('div');
  contextMenu.className = 'fixed hidden bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 min-w-32';
  contextMenu.innerHTML = `
    <div class="p-2 border-b border-slate-600">
      <span class="text-sm text-slate-300">Note Options</span>
    </div>
    <div class="p-1">
      <button id="toggle-slide" class="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
        Toggle Slide
      </button>
      <button id="delete-note" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded">
        Delete Note
      </button>
    </div>
  `;
  document.body.appendChild(contextMenu);

  let selectedNote: any = null;

  // Handle canvas right-click for context menu
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find note at click position
    const W = canvas.width;
    const bars = 16;
    const ticksPerBar = song.ppq * song.ts.num;
    const totalTicks = bars * ticksPerBar;
    
    const clickTick = (x / W) * totalTicks;
    const clickTrack = Math.floor((y - 50) / 30);
    
    if (clickTrack >= 0 && clickTrack < song.tracks.length) {
      const track = song.tracks[clickTrack];
      const clip = track.clips[0];
      
      // Find note at this position
      selectedNote = clip.notes.find(note => {
        const noteStart = clip.start + note.tick;
        const noteEnd = noteStart + note.dur;
        return clickTick >= noteStart && clickTick < noteEnd;
      });
      
      if (selectedNote) {
        // Update context menu
        const toggleSlideBtn = contextMenu.querySelector('#toggle-slide') as HTMLButtonElement;
        toggleSlideBtn.textContent = selectedNote.slide ? 'Remove Slide' : 'Add Slide';
        
        // Show context menu
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';
        contextMenu.classList.remove('hidden');
      }
    }
  });

  // Handle context menu actions
  contextMenu.querySelector('#toggle-slide')?.addEventListener('click', () => {
    if (selectedNote) {
      selectedNote.slide = !selectedNote.slide;
      drawGrid();
    }
    contextMenu.classList.add('hidden');
  });

  contextMenu.querySelector('#delete-note')?.addEventListener('click', () => {
    if (selectedNote) {
      const track = song.tracks[0];
      const index = track.clips[0].notes.indexOf(selectedNote);
      if (index > -1) {
        track.clips[0].notes.splice(index, 1);
        drawGrid();
      }
    }
    contextMenu.classList.add('hidden');
  });

  // Hide context menu when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target as Node)) {
      contextMenu.classList.add('hidden');
    }
  });

  // Add timeline
  const timeline = document.createElement('div');
  timeline.className = 'flex items-center gap-2 text-sm text-slate-400';
  const timeDisplay = document.createElement('span');
  timeDisplay.textContent = '0:00';
  timeline.appendChild(timeDisplay);

  // Assemble layout
  rightPanel.append(canvas, mini, timeline);
  leftPanel.appendChild(channelRackContainer);
  layout.appendChild(leftPanel);
  layout.appendChild(rightPanel);
  
  wrap.append(controls, layout);
  container.appendChild(wrap);

  const eng = createEngine();
  const song: Song = {
    ppq: 96,
    bpm: 120,
    ts: { num: 4, den: 4 },
    loop: { enabled: false, start: 0, end: 96 * 16 },
    tracks: [
      {
        id: 't1', name: 'Piano', instrument: 'Piano', volume: 0.8, presetId: 'analog-warm-pad', clips: [
          { id: 'c1', start: 0, notes: [
            { midi: 60, tick: 0, dur: 24 },
            { midi: 64, tick: 24, dur: 24 },
            { midi: 67, tick: 48, dur: 24 },
            { midi: 72, tick: 72, dur: 24 },
          ]}
        ]
      },
      {
        id: 't2', name: 'Bass', instrument: 'Bass', volume: 0.7, presetId: 'bass-sub', clips: [
          { id: 'c2', start: 0, notes: [
            { midi: 36, tick: 0, dur: 48 },
            { midi: 36, tick: 96, dur: 48 },
          ]}
        ]
      },
      {
        id: 't3', name: 'Drums', instrument: 'Drums', volume: 0.8, presetId: 'kick-808', clips: [
          { id: 'c3', start: 0, notes: [
            { midi: 36, tick: 0, dur: 12 },
            { midi: 36, tick: 48, dur: 12 },
            { midi: 36, tick: 96, dur: 12 },
            { midi: 36, tick: 144, dur: 12 },
          ]}
        ]
      }
    ]
  };
  eng.load(song);

  // Initialize channel rack
  const channelRack = new ChannelRack(channelRackContainer, {
    onPresetSelect: (preset) => {
      // Update the currently selected track with the new preset
      const selectedTrackIndex = 0; // For now, always update first track
      eng.setTrackPreset(selectedTrackIndex, preset.id);
      console.log(`Applied preset ${preset.name} to track ${selectedTrackIndex}`);
    },
    onPresetPreview: (preset) => {
      eng.previewPreset(preset);
    }
  });

  // Particle system
  const particles: Particle[] = [];
  let particleEnabled = false;
  let selectedEffect = 'sparkles';

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    type: string;

    constructor(x: number, y: number, type: string) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.maxLife = 60 + Math.random() * 60;
      this.life = this.maxLife;
      
      switch (type) {
        case 'sparkles':
          this.vx = (Math.random() - 0.5) * 4;
          this.vy = (Math.random() - 0.5) * 4 - 2;
          this.color = `hsl(${Math.random() * 60 + 30}, 100%, 70%)`;
          this.size = 2 + Math.random() * 3;
          break;
        case 'fireworks':
          this.vx = (Math.random() - 0.5) * 8;
          this.vy = (Math.random() - 0.5) * 8;
          this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
          this.size = 3 + Math.random() * 4;
          break;
        case 'rings':
          this.vx = 0;
          this.vy = 0;
          this.color = `hsl(${Math.random() * 60 + 200}, 80%, 60%)`;
          this.size = 5 + Math.random() * 10;
          break;
        case 'stars':
          this.vx = (Math.random() - 0.5) * 3;
          this.vy = (Math.random() - 0.5) * 3;
          this.color = `hsl(${Math.random() * 60 + 45}, 100%, 70%)`;
          this.size = 1 + Math.random() * 2;
          break;
        case 'bubbles':
          this.vx = (Math.random() - 0.5) * 2;
          this.vy = -1 - Math.random() * 2;
          this.color = `hsl(${Math.random() * 60 + 180}, 70%, 80%)`;
          this.size = 4 + Math.random() * 6;
          break;
        case 'dust':
          this.vx = (Math.random() - 0.5) * 1;
          this.vy = (Math.random() - 0.5) * 1;
          this.color = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
          this.size = 1 + Math.random() * 2;
          break;
        case 'lightning':
          this.vx = (Math.random() - 0.5) * 6;
          this.vy = (Math.random() - 0.5) * 6;
          this.color = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`;
          this.size = 2 + Math.random() * 3;
          break;
        case 'smoke':
          this.vx = (Math.random() - 0.5) * 1;
          this.vy = -0.5 - Math.random() * 1;
          this.color = `rgba(128, 128, 128, ${0.4 + Math.random() * 0.3})`;
          this.size = 3 + Math.random() * 5;
          break;
        case 'energy':
          this.vx = (Math.random() - 0.5) * 5;
          this.vy = (Math.random() - 0.5) * 5;
          this.color = `hsl(${Math.random() * 60 + 120}, 100%, 60%)`;
          this.size = 2 + Math.random() * 4;
          break;
        case 'magic':
          this.vx = (Math.random() - 0.5) * 3;
          this.vy = (Math.random() - 0.5) * 3;
          this.color = `hsl(${Math.random() * 60 + 270}, 100%, 70%)`;
          this.size = 2 + Math.random() * 3;
          break;
        default:
          this.vx = (Math.random() - 0.5) * 2;
          this.vy = (Math.random() - 0.5) * 2;
          this.color = '#ffffff';
          this.size = 2;
      }
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      
      if (this.type === 'rings') {
        this.size += 0.5;
      }
      
      if (this.type === 'bubbles') {
        this.size += 0.1;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      const alpha = this.life / this.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      
      switch (this.type) {
        case 'sparkles':
        case 'stars':
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'fireworks':
        case 'energy':
        case 'magic':
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
        case 'rings':
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'bubbles':
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
        case 'dust':
        case 'smoke':
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'lightning':
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size;
          ctx.beginPath();
          ctx.moveTo(this.x - 5, this.y - 5);
          ctx.lineTo(this.x + 5, this.y + 5);
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  function createParticles(x: number, y: number, count: number = 5) {
    if (!particleEnabled) return;
    
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, selectedEffect));
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles(ctx: CanvasRenderingContext2D) {
    particles.forEach(particle => particle.draw(ctx));
  }

  // Function to get note position on canvas
  function getNotePosition(midi: number, trackIndex: number, startTime: number): { x: number, y: number } {
    const W = canvas.width;
    const bars = 16;
    const ticksPerBar = song.ppq * song.ts.num;
    const totalTicks = bars * ticksPerBar;
    
    // Convert time to ticks (approximate)
    const beatsPerSecond = song.bpm / 60;
    const ticksPerSecond = beatsPerSecond * song.ppq;
    const tick = startTime * ticksPerSecond;
    
    const x = (tick / totalTicks) * W;
    const y = 50 + trackIndex * 30 + 10; // Center of the note
    
    return { x, y };
  }

  // Event listeners for particle controls
  particleToggle.addEventListener('change', (e) => {
    particleEnabled = (e.target as HTMLInputElement).checked;
    particleEffectSelect.disabled = !particleEnabled;
    if (!particleEnabled) {
      particles.length = 0; // Clear all particles
    }
  });

  particleEffectSelect.addEventListener('change', (e) => {
    selectedEffect = (e.target as HTMLSelectElement).value;
  });

  // Listen for note play events
  eng.onNotePlay((event: NotePlayEvent) => {
    const position = getNotePosition(event.midi, event.trackIndex, event.startTime);
    createParticles(position.x, position.y, 8);
  });

  play.addEventListener('click', () => eng.play());
  pause.addEventListener('click', () => eng.pause());
  stop.addEventListener('click', () => eng.stop());
  bpm.addEventListener('change', () => eng.setBpm(parseFloat((bpm as HTMLInputElement).value || '120')));

  // Enhanced drawing functions
  const ctx = canvas.getContext('2d')!;
  const mctx = mini.getContext('2d')!;
  
  function size() {
    canvas.width = canvas.clientWidth; 
    // Set height based on number of tracks
    const trackHeight = 30;
    const headerHeight = 50;
    const minHeight = 96 * 4; // 96px * 4 = 384px
    const calculatedHeight = headerHeight + (song.tracks.length * trackHeight);
    canvas.height = Math.max(minHeight, calculatedHeight);
    
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
    
    // Draw track separators
    const trackHeight = 30;
    const headerHeight = 50;
    ctx.strokeStyle = 'rgba(255,255,255,.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= song.tracks.length; i++) {
      const y = headerHeight + (i * trackHeight);
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }
    
    // Draw notes
    drawNotes();
    
    // Draw particles
    drawParticles(ctx);
  }
  
  function drawNotes() {
    const W = canvas.width, H = canvas.height;
    const bars = 16;
    const ticksPerBar = song.ppq * song.ts.num;
    const totalTicks = bars * ticksPerBar;
    
    // Note colors
    const noteColors = ['#4ab0ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    // Draw track labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    song.tracks.forEach((track, trackIndex) => {
      const y = 50 + trackIndex * 30;
      ctx.fillText(track.name, 10, y + 15);
    });
    
    song.tracks.forEach((track, trackIndex) => {
      track.clips.forEach(clip => {
        clip.notes.forEach(note => {
          const startX = (clip.start + note.tick) / totalTicks * W;
          const width = note.dur / totalTicks * W;
          const noteHeight = 20;
          const y = 50 + trackIndex * 30;
          
          // Draw rounded rectangle for note
          const radius = 6;
          const x = startX;
          const w = Math.max(width, 2);
          const h = noteHeight;
          
          // Use different styling for slide notes
          const baseColor = noteColors[trackIndex % noteColors.length];
          if (note.slide) {
            // Slide notes get a gradient effect
            const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, '#ff6b9d');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = baseColor;
          }
          
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
          
          // Note border - different for slide notes
          ctx.strokeStyle = note.slide ? '#ff6b9d' : '#1e9bff';
          ctx.lineWidth = note.slide ? 2 : 1;
          ctx.stroke();
          
          // Note label
          const noteName = getNoteName(note.midi);
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(noteName, x + w/2, y + h/2 + 3);
          
          // Draw slide indicator
          if (note.slide) {
            ctx.fillStyle = '#ff6b9d';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('→', x + w + 2, y + h/2 + 2);
          }
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
  
  // Animation loop for particles
  function animate() {
    updateParticles();
    drawGrid();
    drawMinimap();
    requestAnimationFrame(animate);
  }
  
  const ro = new ResizeObserver(() => {
    drawGrid();
    drawMinimap();
  }); 
  ro.observe(canvas); 
  ro.observe(mini);
  
  // Start animation loop
  animate();
}

function btn(label: string, color: string){ const b=document.createElement('button'); b.className=`px-3 py-2 rounded-md ${color} hover:opacity-90 text-white text-sm`; b.textContent=label; return b; }
function input(type: string, val: string){ const i=document.createElement('input'); i.type=type; (i as HTMLInputElement).value=val; i.className='focus-ring rounded-md px-3 py-2 border border-slate-600 bg-transparent text-sm'; return i; }
function label(text: string, el: HTMLElement){ const w=document.createElement('label'); w.className='flex items-center gap-2 text-sm'; w.appendChild(el); w.appendChild(document.createTextNode(text)); return w; }

