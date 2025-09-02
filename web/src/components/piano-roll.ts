import { useStore, useActions, useSelectedPattern, useSelectedNotes } from '../store';
import type { Pattern, PatternChannel, Note, ID, Ticks } from '../engine/types';

export class PianoRoll {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pianoKeys: HTMLElement;
  private dragState: {
    isDragging: boolean;
    noteId: string | null;
    startX: number;
    startY: number;
    originalNote: Note | null;
    isResizing: boolean;
    isCreating: boolean;
  } = {
    isDragging: false,
    noteId: null,
    startX: 0,
    startY: 0,
    originalNote: null,
    isResizing: false,
    isCreating: false
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.pianoKeys = document.createElement('div');
    this.setupLayout();
    this.setupEventListeners();
    this.render();
  }

  private setupLayout(): void {
    this.container.className = 'flex h-full bg-slate-900 border border-slate-700 rounded-md';
    
    // Piano keys panel
    this.pianoKeys.className = 'w-16 bg-slate-800 border-r border-slate-700 flex-shrink-0';
    this.container.appendChild(this.pianoKeys);
    
    // Canvas panel
    this.canvas.className = 'flex-1 bg-slate-900';
    this.container.appendChild(this.canvas);
    
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));

    // Keyboard events
    this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.canvas.setAttribute('tabindex', '0');

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
      this.render();
    });
    resizeObserver.observe(this.container);
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const note = this.getNoteAtPosition(x, y);
    if (note) {
      this.dragState = {
        isDragging: true,
        noteId: note.id,
        startX: x,
        startY: y,
        originalNote: { ...note },
        isResizing: this.isNearNoteEdge(x, y, note),
        isCreating: false
      };

      // Select note
      const actions = useActions();
      actions.setSelection({ noteIds: [note.id] });
    } else {
      // Start creating new note
      this.dragState = {
        isDragging: true,
        noteId: null,
        startX: x,
        startY: y,
        originalNote: null,
        isResizing: false,
        isCreating: true
      };
    }

    this.render();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.dragState.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.dragState.isCreating) {
      // Creating new note - show preview
      this.render();
      this.drawNotePreview(x, y);
      return;
    }

    if (!this.dragState.noteId || !this.dragState.originalNote) return;

    const actions = useActions();
    const deltaX = x - this.dragState.startX;
    const deltaY = y - this.dragState.startY;

    if (this.dragState.isResizing) {
      // Resize note
      const deltaTicks = this.pixelsToTicks(deltaX);
      const newLength = Math.max(this.project.ppq / 16, this.dragState.originalNote.length + deltaTicks);
      actions.updateNote(this.dragState.noteId, { length: newLength });
    } else {
      // Move note
      const deltaTicks = this.pixelsToTicks(deltaX);
      const deltaPitch = this.pixelsToPitch(deltaY);
      const newTime = Math.max(0, this.dragState.originalNote.time + deltaTicks);
      const newPitch = Math.max(0, Math.min(127, this.dragState.originalNote.pitch - deltaPitch));
      
      actions.updateNote(this.dragState.noteId, { 
        time: newTime, 
        pitch: newPitch 
      });
    }

    this.render();
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.dragState.isCreating && this.dragState.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.createNoteAtPosition(x, y);
    }

    this.dragState.isDragging = false;
    this.dragState.noteId = null;
    this.dragState.originalNote = null;
    this.dragState.isCreating = false;
    this.render();
  }

  private handleDoubleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.createNoteAtPosition(x, y);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const selectedNotes = useStore.getState().selection.noteIds;
    const actions = useActions();

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        selectedNotes.forEach(noteId => {
          actions.deleteNote(noteId);
        });
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          selectedNotes.forEach(noteId => {
            actions.duplicateNote(noteId);
          });
        }
        break;
    }

    this.render();
  }

  private getNoteAtPosition(x: number, y: number): Note | null {
    const selectedPattern = useStore.getState().selection.patternId;
    if (!selectedPattern) return null;

    const pattern = useStore.getState().project.patterns[selectedPattern];
    if (!pattern) return null;

    const selectedChannel = useStore.getState().selection.channelId;
    if (!selectedChannel) return null;

    const channel = pattern.channels.find(c => c.id === selectedChannel);
    if (!channel || !channel.notes) return null;

    for (const note of channel.notes) {
      const noteX = this.ticksToPixels(note.time);
      const noteY = this.pitchToPixels(note.pitch);
      const noteWidth = this.ticksToPixels(note.length);
      const noteHeight = 20; // Fixed note height

      if (x >= noteX && x <= noteX + noteWidth && 
          y >= noteY && y <= noteY + noteHeight) {
        return note;
      }
    }

    return null;
  }

  private isNearNoteEdge(x: number, y: number, note: Note): boolean {
    const noteX = this.ticksToPixels(note.time);
    const noteWidth = this.ticksToPixels(note.length);
    const edgeThreshold = 8; // pixels

    return x >= noteX + noteWidth - edgeThreshold && x <= noteX + noteWidth + edgeThreshold;
  }

  private createNoteAtPosition(x: number, y: number): void {
    const selectedPattern = useStore.getState().selection.patternId;
    const selectedChannel = useStore.getState().selection.channelId;
    
    if (!selectedPattern || !selectedChannel) return;

    const time = this.pixelsToTicks(x);
    const pitch = this.pixelsToPitch(y);
    const length = this.project.ppq / 4; // Quarter note default

    const actions = useActions();
    actions.createNote(selectedChannel, {
      time,
      pitch,
      length,
      velocity: 100
    });

    this.render();
  }

  private pixelsToTicks(pixels: number): Ticks {
    const zoomX = useStore.getState().ui.zoomX;
    const pixelsPerBeat = 50 * zoomX;
    const ppq = useStore.getState().project.ppq;
    return (pixels / pixelsPerBeat) * ppq;
  }

  private ticksToPixels(ticks: Ticks): number {
    const zoomX = useStore.getState().ui.zoomX;
    const pixelsPerBeat = 50 * zoomX;
    const ppq = useStore.getState().project.ppq;
    return (ticks / ppq) * pixelsPerBeat;
  }

  private pixelsToPitch(pixels: number): number {
    const noteHeight = 20;
    const startPitch = 127; // C8
    return Math.max(0, Math.min(127, startPitch - Math.floor(pixels / noteHeight)));
  }

  private pitchToPixels(pitch: number): number {
    const noteHeight = 20;
    const startPitch = 127; // C8
    return (startPitch - pitch) * noteHeight;
  }

  private drawNotePreview(x: number, y: number): void {
    const startX = this.dragState.startX;
    const startY = this.dragState.startY;
    
    const time = this.pixelsToTicks(Math.min(startX, x));
    const length = this.pixelsToTicks(Math.abs(x - startX));
    const pitch = this.pixelsToPitch(y);

    const noteX = this.ticksToPixels(time);
    const noteY = this.pitchToPixels(pitch);
    const noteWidth = this.ticksToPixels(length);
    const noteHeight = 20;

    // Preview note
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    this.ctx.fillRect(noteX, noteY, noteWidth, noteHeight);
    this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(noteX, noteY, noteWidth, noteHeight);
  }

  render(): void {
    this.clear();
    this.drawGrid();
    this.drawNotes();
    this.drawPlayhead();
    this.renderPianoKeys();
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGrid(): void {
    const { ppq, bpm } = useStore.getState().project;
    const zoomX = useStore.getState().ui.zoomX;
    const pixelsPerBeat = 50 * zoomX;
    const noteHeight = 20;
    
    // Draw horizontal lines (pitch grid)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    
    for (let pitch = 0; pitch <= 127; pitch++) {
      const y = this.pitchToPixels(pitch);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw vertical lines (time grid)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let beat = 0; beat < 32; beat++) {
      const x = beat * pixelsPerBeat;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw bar lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    
    for (let bar = 0; bar <= 8; bar++) {
      const x = bar * pixelsPerBeat * 4;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
  }

  private drawNotes(): void {
    const selectedPattern = useStore.getState().selection.patternId;
    if (!selectedPattern) return;

    const pattern = useStore.getState().project.patterns[selectedPattern];
    if (!pattern) return;

    const selectedChannel = useStore.getState().selection.channelId;
    if (!selectedChannel) return;

    const channel = pattern.channels.find(c => c.id === selectedChannel);
    if (!channel || !channel.notes) return;

    const selectedNotes = useStore.getState().selection.noteIds;

    channel.notes.forEach(note => {
      const x = this.ticksToPixels(note.time);
      const y = this.pitchToPixels(note.pitch);
      const width = this.ticksToPixels(note.length);
      const height = 20;

      const isSelected = selectedNotes.includes(note.id);
      
      // Note background
      this.ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)';
      this.ctx.fillRect(x, y, width, height);

      // Note border
      this.ctx.strokeStyle = isSelected ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 0.8)';
      this.ctx.lineWidth = isSelected ? 2 : 1;
      this.ctx.strokeRect(x, y, width, height);

      // Note label (pitch)
      this.ctx.fillStyle = 'white';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.getNoteName(note.pitch), x + width / 2, y + height / 2 + 3);

      // Resize handle
      if (isSelected) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(x + width - 6, y + height - 6, 6, 6);
      }
    });
  }

  private drawPlayhead(): void {
    const position = useStore.getState().transport.position;
    const x = this.ticksToPixels(position);
    
    this.ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();
  }

  private renderPianoKeys(): void {
    this.pianoKeys.innerHTML = '';
    
    for (let pitch = 127; pitch >= 0; pitch--) {
      const key = document.createElement('div');
      key.className = 'h-5 border-b border-slate-700 flex items-center justify-center text-xs';
      
      const isBlack = this.isBlackKey(pitch);
      key.style.backgroundColor = isBlack ? '#1e293b' : '#334155';
      key.style.color = isBlack ? '#cbd5e1' : '#1e293b';
      
      key.textContent = this.getNoteName(pitch);
      this.pianoKeys.appendChild(key);
    }
  }

  private isBlackKey(pitch: number): boolean {
    const note = pitch % 12;
    return [1, 3, 6, 8, 10].includes(note);
  }

  private getNoteName(pitch: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(pitch / 12) - 1;
    const note = pitch % 12;
    return `${noteNames[note]}${octave}`;
  }
}

// Legacy compatibility
export function mountPianoRoll(container: HTMLElement): PianoRoll {
  return new PianoRoll(container);
}
