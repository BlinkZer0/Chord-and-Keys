export type NoteEvent = {
  midi: number;
  tick: number;
  dur: number;
  vel?: number;
  slide?: boolean;
};

export type Clip = {
  id: string;
  start: number; // tick
  notes: NoteEvent[];
};

export type Track = {
  id: string;
  name: string;
  instrument: string;
  volume?: number;
  mute?: boolean;
  clips: Clip[];
  presetId?: string;
};

export type TimeSignature = { num: number; den: number };

export type Song = {
  ppq: number;
  bpm: number;
  ts: TimeSignature;
  loop: { enabled: boolean; start: number; end: number };
  tracks: Track[];
};

export interface NotePlayEvent {
  midi: number;
  startTime: number;
  duration: number;
  trackIndex: number;
}

export type Engine = {
  setBpm(bpm: number): void;
  setTimeSignature(ts: TimeSignature): void;
  load(song: Song): void;
  play(): void;
  pause(): void;
  stop(): void;
  onNotePlay(callback: (event: NotePlayEvent) => void): void;
  offNotePlay(callback: (event: NotePlayEvent) => void): void;
  previewPreset(preset: any): void;
  setTrackPreset(trackIndex: number, presetId: string): void;
};

