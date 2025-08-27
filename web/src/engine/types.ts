export type NoteEvent = {
  midi: number;
  tick: number;
  dur: number;
  vel?: number;
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
};

export type TimeSignature = { num: number; den: number };

export type Song = {
  ppq: number;
  bpm: number;
  ts: TimeSignature;
  loop: { enabled: boolean; start: number; end: number };
  tracks: Track[];
};

export type Engine = {
  setBpm(bpm: number): void;
  setTimeSignature(ts: TimeSignature): void;
  load(song: Song): void;
  play(): void;
  pause(): void;
  stop(): void;
};

