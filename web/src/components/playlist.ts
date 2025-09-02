import { useStore, useActions, usePlaylistTracks, usePlaylistOrder, useClips, useSelectedClips } from '../store';
import type { PatternClip, PlaylistTrack, ID, Ticks } from '../engine/types';

export class Playlist {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dragState: {
    isDragging: boolean;
    clipId: ID | null;
    startX: number;
    startY: number;
    originalStart: Ticks;
    isResizing: boolean;
  } = {
    isDragging: false,
    clipId: null,
    startX: 0,
    startY: 0,
    originalStart: 0,
    isResizing: false
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
    this.setupEventListeners();
    this.render();
  }

  private setupCanvas(): void {
    this.canvas.className = 'w-full h-full bg-slate-900 border border-slate-700 rounded-md';
    this.container.appendChild(this.canvas);
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const rect = this.container.getBoundingClientRect();
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

    const clip = this.getClipAtPosition(x, y);
    if (clip) {
      this.dragState = {
        isDragging: true,
        clipId: clip.id,
        startX: x,
        startY: y,
        originalStart: clip.start,
        isResizing: this.isNearClipEdge(x, y, clip)
      };

      // Select clip
      const actions = useActions();
      actions.setSelection({ clipIds: [clip.id] });
    } else {
      // Clear selection
      const actions = useActions();
      actions.setSelection({ clipIds: [] });
    }

    this.render();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.dragState.isDragging || !this.dragState.clipId) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const deltaX = x - this.dragState.startX;

    const actions = useActions();
    const clips = useStore.getState().project.clips;
    const clip = clips[this.dragState.clipId];

    if (clip) {
      if (this.dragState.isResizing) {
        // Resize clip
        const deltaTicks = this.pixelsToTicks(deltaX);
        const minLen = useStore.getState().project.ppq / 4; // 16th note
        const newLength = Math.max(minLen, clip.length + deltaTicks);
        actions.resizeClip(clip.id, newLength);
      } else {
        // Move clip
        const deltaTicks = this.pixelsToTicks(deltaX);
        const newStart = Math.max(0, this.dragState.originalStart + deltaTicks);
        actions.moveClip(clip.id, newStart - clip.start);
      }
    }

    this.render();
  }

  private handleMouseUp(e: MouseEvent): void {
    this.dragState.isDragging = false;
    this.dragState.clipId = null;
  }

  private handleDoubleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const trackIndex = this.getTrackIndexFromY(y);
    if (trackIndex >= 0) {
      this.createClipAtPosition(x, trackIndex);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const selectedClips = useStore.getState().selection.clipIds;
    const actions = useActions();

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        selectedClips.forEach(clipId => {
          actions.deleteClip(clipId);
        });
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          selectedClips.forEach(clipId => {
            actions.duplicateClip(clipId);
          });
        }
        break;
    }

    this.render();
  }

  private getClipAtPosition(x: number, y: number): PatternClip | null {
    const clips = useStore.getState().project.clips;
    const trackIndex = this.getTrackIndexFromY(y);
    
    if (trackIndex < 0) return null;

    const trackId = this.getTrackIdFromIndex(trackIndex);
    if (!trackId) return null;

    const trackClips = Object.values(clips).filter(clip => clip.trackId === trackId);
    
    for (const clip of trackClips) {
      const clipX = this.ticksToPixels(clip.start);
      const clipWidth = this.ticksToPixels(clip.length);
      
      if (x >= clipX && x <= clipX + clipWidth) {
        return clip as PatternClip;
      }
    }

    return null;
  }

  private isNearClipEdge(x: number, y: number, clip: PatternClip): boolean {
    const clipX = this.ticksToPixels(clip.start);
    const clipWidth = this.ticksToPixels(clip.length);
    const edgeThreshold = 8; // pixels

    return x >= clipX + clipWidth - edgeThreshold && x <= clipX + clipWidth + edgeThreshold;
  }

  private getTrackIndexFromY(y: number): number {
    const trackHeight = 60; // pixels per track
    return Math.floor(y / trackHeight);
  }

  private getTrackIdFromIndex(index: number): ID | null {
    const order = useStore.getState().project.order;
    return order[index] || null;
  }

  private createClipAtPosition(x: number, trackIndex: number): void {
    const trackId = this.getTrackIdFromIndex(trackIndex);
    if (!trackId) return;

    const patterns = useStore.getState().project.patterns;
    const patternIds = Object.keys(patterns);
    
    if (patternIds.length === 0) {
      // Create a default pattern if none exists
      const actions = useActions();
      actions.createPattern('Default Pattern');
      return;
    }

    const startTicks = this.pixelsToTicks(x);
    const patternId = patternIds[0]; // Use first pattern for now
    
    const actions = useActions();
    actions.createPatternClip(trackId, patternId, startTicks);
    this.render();
  }

  private pixelsToTicks(pixels: number): Ticks {
    const zoomX = useStore.getState().ui.zoomX;
    const pixelsPerBeat = 50 * zoomX; // 50 pixels per beat at 1x zoom
    const ppq = useStore.getState().project.ppq;
    return (pixels / pixelsPerBeat) * ppq;
  }

  private ticksToPixels(ticks: Ticks): number {
    const zoomX = useStore.getState().ui.zoomX;
    const pixelsPerBeat = 50 * zoomX;
    const ppq = useStore.getState().project.ppq;
    return (ticks / ppq) * pixelsPerBeat;
  }

  render(): void {
    this.clear();
    this.drawGrid();
    this.drawTracks();
    this.drawClips();
    this.drawPlayhead();
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGrid(): void {
    const { ppq, bpm } = useStore.getState().project;
    const zoomX = useStore.getState().ui.zoomX;
    const pixelsPerBeat = 50 * zoomX;
    
    // Draw beat lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let beat = 0; beat < 32; beat++) { // 32 beats
      const x = beat * pixelsPerBeat;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw bar lines (every 4 beats)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    
    for (let bar = 0; bar <= 8; bar++) { // 8 bars
      const x = bar * pixelsPerBeat * 4;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
  }

  private drawTracks(): void {
    const tracks = useStore.getState().project.playlistTracks;
    const order = useStore.getState().project.order;
    const trackHeight = 60;

    order.forEach((trackId, index) => {
      const track = tracks[trackId];
      if (!track) return;

      const y = index * trackHeight;
      
      // Track background
      this.ctx.fillStyle = index % 2 === 0 ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
      this.ctx.fillRect(0, y, this.canvas.width, trackHeight);

      // Track border
      this.ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(0, y, this.canvas.width, trackHeight);

      // Track name
      this.ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(track.name, 10, y + 20);
    });
  }

  private drawClips(): void {
    const clips = useStore.getState().project.clips;
    const tracks = useStore.getState().project.playlistTracks;
    const order = useStore.getState().project.order;
    const selectedClips = useStore.getState().selection.clipIds;
    const trackHeight = 60;

    Object.values(clips).forEach(clip => {
      const trackIndex = order.indexOf(clip.trackId);
      if (trackIndex === -1) return;

      const y = trackIndex * trackHeight + 10;
      const x = this.ticksToPixels(clip.start);
      const width = this.ticksToPixels(clip.length);
      const height = trackHeight - 20;

      // Clip background
      const isSelected = selectedClips.includes(clip.id);
      this.ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)';
      this.ctx.fillRect(x, y, width, height);

      // Clip border
      this.ctx.strokeStyle = isSelected ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 0.8)';
      this.ctx.lineWidth = isSelected ? 2 : 1;
      this.ctx.strokeRect(x, y, width, height);

      // Clip name
      this.ctx.fillStyle = 'white';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(clip.name || 'Clip', x + width / 2, y + height / 2 + 3);

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

    // Playhead triangle
    this.ctx.fillStyle = 'rgba(34, 197, 94, 1)';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 6, 0);
    this.ctx.lineTo(x + 6, 0);
    this.ctx.lineTo(x, 12);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

// Legacy compatibility
export function mountPlaylist(container: HTMLElement): Playlist {
  return new Playlist(container);
}
