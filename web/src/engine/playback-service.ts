import { audioEngine } from './audio-engine';
import { PatternCompiler } from './pattern-compiler';
import { useStore } from '../store';
import type { 
  Project, 
  TransportState, 
  EngineNote, 
  Ticks, 
  Seconds,
  ID 
} from './types';

export class PlaybackService {
  private compiler: PatternCompiler;
  private project: Project;
  private transport: TransportState;
  private scheduledUntil: Ticks = 0;
  private rescheduleId: string | null = null;
  private notePlayCallbacks: Array<(event: any) => void> = [];

  constructor() {
    this.project = useStore.getState().project;
    this.transport = useStore.getState().transport;
    this.compiler = new PatternCompiler(this.project);

    // Subscribe to store changes
    useStore.subscribe((state) => {
      this.project = state.project;
      this.transport = state.transport;
      this.compiler = new PatternCompiler(this.project);
    });
  }

  /**
   * Start playback based on current transport mode
   */
  async play(): Promise<void> {
    if (this.transport.playing) return;

    // Update transport state
    useStore.getState().dispatchCommand({
      type: 'SetTransportMode',
      mode: this.transport.mode
    });

    // Set transport to playing
    audioEngine.setTransport({ playing: true });
    useStore.getState().dispatchCommand({ type: 'SetTransportPlaying', playing: true });

    // Schedule based on mode
    if (this.transport.mode === 'pattern') {
      await this.schedulePatternMode();
    } else {
      await this.scheduleSongMode();
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    audioEngine.setTransport({ playing: false });
    useStore.getState().dispatchCommand({ type: 'SetTransportPlaying', playing: false });
  }

  /**
   * Stop playback and reset position
   */
  stop(): void {
    audioEngine.setTransport({ playing: false, position: 0 });
    useStore.getState().dispatchCommand({ type: 'SetTransportPlaying', playing: false });
    useStore.getState().dispatchCommand({ type: 'SetTransportPosition', position: 0 });
    this.scheduledUntil = 0;
    this.clearScheduledEvents();
  }

  /**
   * Set BPM
   */
  setBpm(bpm: number): void {
    audioEngine.setTransport({ bpm });
    useStore.getState().dispatchCommand({ type: 'SetBpm', bpm });
  }

  /**
   * Set transport mode
   */
  setTransportMode(mode: 'pattern' | 'song'): void {
    useStore.getState().dispatchCommand({ type: 'SetTransportMode', mode });
  }

  /**
   * Set selected pattern for pattern mode
   */
  setSelectedPattern(patternId: ID): void {
    useStore.getState().dispatchCommand({ type: 'SetSelectedPattern', patternId });
  }

  /**
   * Schedule pattern mode playback
   */
  private async schedulePatternMode(): Promise<void> {
    const { selectedPatternId } = this.transport;
    if (!selectedPatternId) {
      console.warn('No pattern selected for pattern mode');
      return;
    }

    const pattern = this.project.patterns[selectedPatternId];
    if (!pattern) {
      console.warn(`Pattern ${selectedPatternId} not found`);
      return;
    }

    // Load required instruments
    await this.loadPatternInstruments(pattern);

    // Compile pattern
    const notes = this.compiler.compilePatternMode(selectedPatternId);

    // Schedule notes
    if (notes.length > 0) {
      audioEngine.scheduleNotes(notes, 0);
    }

    // Set up loop
    const patternLengthSeconds = this.ticksToSeconds(pattern.length);
    this.schedulePatternLoop(patternLengthSeconds);
  }

  /**
   * Schedule song mode playback
   */
  private async scheduleSongMode(): Promise<void> {
    // Calculate song length
    const songLength = this.calculateSongLength();
    if (songLength === 0) {
      console.warn('No clips found for song mode');
      return;
    }

    // Load all required instruments
    await this.loadSongInstruments();

    // Schedule initial window
    await this.scheduleSongWindow(0, Math.min(songLength, this.project.ppq * 16)); // 16 bars ahead

    // Set up rescheduling
    this.setupSongRescheduling();
  }

  /**
   * Schedule a window of the song
   */
  private async scheduleSongWindow(from: Ticks, to: Ticks): Promise<void> {
    const notes = this.compiler.compileSongWindow(from, to);
    
    if (notes.length > 0) {
      const startTime = this.ticksToSeconds(from);
      audioEngine.scheduleNotes(notes, startTime);
    }

    this.scheduledUntil = to;
  }

  /**
   * Set up rescheduling for song mode
   */
  private setupSongRescheduling(): void {
    // Clear existing reschedule
    if (this.rescheduleId) {
      // In a real implementation, you'd clear the Tone.Transport event
      this.rescheduleId = null;
    }

    // Schedule rescheduling every 8 bars
    const rescheduleInterval = this.project.ppq * 8; // 8 bars
    const rescheduleTime = this.ticksToSeconds(rescheduleInterval);

    // In a real implementation, you'd use Tone.Transport.scheduleRepeat
    // For now, we'll use a simple timeout
    setTimeout(() => {
      if (this.transport.playing && this.transport.mode === 'song') {
        this.rescheduleSong();
      }
    }, rescheduleTime * 1000);
  }

  /**
   * Reschedule song playback
   */
  private async rescheduleSong(): Promise<void> {
    const currentTime = this.ticksToSeconds(this.transport.position);
    const lookAhead = this.project.ppq * 16; // 16 bars ahead
    const from = this.transport.position;
    const to = from + lookAhead;

    await this.scheduleSongWindow(from, to);
    this.setupSongRescheduling();
  }

  /**
   * Set up pattern loop
   */
  private schedulePatternLoop(patternLengthSeconds: Seconds): void {
    // In a real implementation, you'd use Tone.Transport.scheduleRepeat
    // For now, we'll use a simple interval
    setInterval(() => {
      if (this.transport.playing && this.transport.mode === 'pattern') {
        this.schedulePatternMode();
      }
    }, patternLengthSeconds * 1000);
  }

  /**
   * Load instruments required for a pattern
   */
  private async loadPatternInstruments(pattern: any): Promise<void> {
    const instrumentIds = this.compiler.getPatternInstruments(pattern);
    
    for (const instrumentId of instrumentIds) {
      const instrument = this.project.instruments[instrumentId];
      if (instrument) {
        try {
          await audioEngine.loadInstrument(instrument);
        } catch (error) {
          console.error(`Failed to load instrument ${instrumentId}:`, error);
        }
      }
    }
  }

  /**
   * Load all instruments required for the song
   */
  private async loadSongInstruments(): Promise<void> {
    const instrumentIds = new Set<ID>();

    // Collect all instrument IDs from clips
    Object.values(this.project.clips).forEach(clip => {
      if (clip.type === 'pattern') {
        const clipInstruments = this.compiler.getClipInstruments(clip);
        clipInstruments.forEach(id => instrumentIds.add(id));
      }
    });

    // Load instruments
    for (const instrumentId of instrumentIds) {
      const instrument = this.project.instruments[instrumentId];
      if (instrument) {
        try {
          await audioEngine.loadInstrument(instrument);
        } catch (error) {
          console.error(`Failed to load instrument ${instrumentId}:`, error);
        }
      }
    }
  }

  /**
   * Calculate total song length
   */
  private calculateSongLength(): Ticks {
    let maxEnd = 0;
    
    Object.values(this.project.clips).forEach(clip => {
      const clipEnd = clip.start + clip.length;
      maxEnd = Math.max(maxEnd, clipEnd);
    });

    return maxEnd;
  }

  /**
   * Clear all scheduled events
   */
  private clearScheduledEvents(): void {
    // In a real implementation, you'd clear Tone.Transport events
    // For now, we'll just reset our tracking
    this.scheduledUntil = 0;
    this.rescheduleId = null;
  }

  /**
   * Convert ticks to seconds
   */
  private ticksToSeconds(ticks: Ticks): Seconds {
    const { ppq, bpm } = this.project;
    const beatsPerSecond = bpm / 60;
    const ticksPerSecond = beatsPerSecond * ppq;
    return ticks / ticksPerSecond;
  }

  /**
   * Register note play callback
   */
  onNotePlay(callback: (event: any) => void): void {
    this.notePlayCallbacks.push(callback);
  }

  /**
   * Remove note play callback
   */
  offNotePlay(callback: (event: any) => void): void {
    const index = this.notePlayCallbacks.indexOf(callback);
    if (index > -1) {
      this.notePlayCallbacks.splice(index, 1);
    }
  }

  /**
   * Trigger note play callbacks
   */
  private triggerNotePlay(event: any): void {
    this.notePlayCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in note play callback:', error);
      }
    });
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.clearScheduledEvents();
    this.notePlayCallbacks.length = 0;
  }
}

// Create and export singleton instance
export const playbackService = new PlaybackService();
