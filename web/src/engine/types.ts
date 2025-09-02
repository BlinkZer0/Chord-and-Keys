// Core types for the DAW system
export type ID = string;
export type Ticks = number; // PPQ ticks
export type Seconds = number;

// ===== Patterns =====
export interface Pattern {
  id: ID;
  name: string;
  length: Ticks;          // pattern loop length
  resolution: number;     // steps per beat for step seq
  channels: PatternChannel[];
  color?: string;
}

export interface PatternChannel {
  id: ID;
  instrumentId: ID;       // ties to InstrumentDef in project
  steps?: Step[];         // optional for step sequencer
  notes?: Note[];         // piano roll
  mute?: boolean;
  solo?: boolean;
  mixerChannelId?: ID;    // default mixer route
}

export interface Step { 
  stepIndex: number; 
  velocity: number; 
  lengthSteps?: number; 
}

export interface Note { 
  time: Ticks; 
  length: Ticks; 
  pitch: number; 
  velocity: number; 
}

// ===== Arrangement (Playlist) =====
export type ClipType = 'pattern' | 'audio' | 'automation';

export interface ClipBase {
  id: ID;
  type: ClipType;
  trackId: ID;           // playlist track (just a lane)
  start: Ticks;
  length: Ticks;
  loop?: boolean;
  color?: string;
  name?: string;
}

export interface PatternClip extends ClipBase {
  type: 'pattern';
  patternId: ID;
  transpose?: number;
  gainDb?: number;
  channelOverrides?: Record<ID, Partial<PatternChannel>>; // per-inst tweaks
}

export interface AudioClip extends ClipBase {
  type: 'audio';
  assetId: ID;           // audio buffer asset
  offset: Ticks;         // in-file start
  gainDb?: number;
}

export interface AutomationClip extends ClipBase {
  type: 'automation';
  target: AutomationTarget; // e.g., { type:'mixer', channelId, param:'gain' }
  points: AutomationPoint[];
}

export interface AutomationPoint { 
  time: Ticks; 
  value: number; 
  curve?: number; 
}

export interface PlaylistTrack { 
  id: ID; 
  name: string; 
  color?: string; 
  muted?: boolean; 
  locked?: boolean; 
}

// ===== Instruments & Mixer =====
export interface InstrumentDef {
  id: ID; 
  name: string; 
  type: 'sampler' | 'synth' | 'vst' | 'external';
  params: Record<string, any>;
  defaultMixerChannelId?: ID;
}

export interface MixerChannel {
  id: ID; 
  name: string; 
  color?: string;
  inserts: EffectSlot[]; 
  sends: SendSlot[];
  gainDb: number; 
  pan: number; 
  mute?: boolean;
  solo?: boolean;
  reverbSend?: number; // 0..1
  delaySend?: number;  // 0..1
  stereoSeparation?: number; // 0..1 widener
  phaseInvert?: boolean;     // polarity flip
  armed?: boolean;           // record arming
  busId?: ID; // master if undefined
}

export interface EffectSlot { 
  id: ID; 
  effectId: ID; 
  params: Record<string, any>; 
  bypass?: boolean; 
}

export interface SendSlot { 
  id: ID; 
  targetBusId: ID; 
  amount: number; 
}

export interface AutomationTarget {
  type: 'mixer' | 'instrument' | 'effect';
  channelId?: ID;
  param: string;
}

// ===== Project State =====
export interface Project {
  id: ID; 
  name: string; 
  version: number;
  bpm: number; 
  timeSig: [number, number]; 
  ppq: number;
  patterns: Record<ID, Pattern>;
  clips: Record<ID, PatternClip | AudioClip | AutomationClip>;
  playlistTracks: Record<ID, PlaylistTrack>;
  order: ID[]; // visible track order
  instruments: Record<ID, InstrumentDef>;
  mixer: { 
    channels: Record<ID, MixerChannel>; 
    masterId: ID; 
  };
  assets: Record<ID, { kind: 'audio' | 'midi'; uri: string; }>;
}

// ===== Transport & State =====
export interface TransportState {
  mode: 'pattern' | 'song';
  playing: boolean;
  position: Ticks;
  bpm: number;
  selectedPatternId?: ID;
}

export interface SelectionState {
  clipIds: ID[];
  patternId?: ID;
  channelId?: ID;
  noteIds?: ID[];
}

export interface RootState {
  project: Project;
  transport: TransportState;
  selection: SelectionState;
  ui: {
    zoomX: number;
    zoomY: number;
    scrollX: number;
    scrollY: number;
    scheme: string;
  };
}

// ===== Commands =====
export type Command =
  | { type: 'CreatePattern'; id?: ID; name?: string; length?: Ticks; resolution?: number }
  | { type: 'AddChannelToPattern'; patternId: ID; instrumentId: ID; channelId?: ID }
  | { type: 'UpdatePatternChannel'; patternId: ID; channelId: ID; updates: Partial<PatternChannel> }
  | { type: 'DeletePatternChannel'; patternId: ID; channelId: ID }
  | { type: 'InsertNotes'; patternId: ID; channelId: ID; notes: Note[] }
  | { type: 'CreatePlaylistTrack'; trackId?: ID; name?: string }
  | { type: 'CreatePatternClip'; clipId?: ID; trackId: ID; patternId: ID; start: Ticks; length?: Ticks }
  | { type: 'MoveClip'; clipId: ID; delta: Ticks }
  | { type: 'ResizeClip'; clipId: ID; newLength: Ticks }
  | { type: 'SplitClipAt'; clipId: ID; at: Ticks }
  | { type: 'SetTransportMode'; mode: 'pattern' | 'song' }
  | { type: 'SetTransportPlaying'; playing: boolean }
  | { type: 'SetTransportPosition'; position: Ticks }
  | { type: 'SetBpm'; bpm: number }
  | { type: 'SetSelectedPattern'; patternId: ID }
  | { type: 'DeleteClip'; clipId: ID }
  | { type: 'DuplicateClip'; clipId: ID }
  | { type: 'SetSelection'; selection: Partial<SelectionState> }
  | { type: 'CreateInstrument'; id?: ID; name: string; instType: InstrumentDef['type']; params?: Record<string, any>; mixerChannelId?: ID }
  | { type: 'CreateMixerChannel'; id?: ID; name?: string; color?: string }
  | { type: 'SetMixerChannel'; channelId: ID; updates: Partial<MixerChannel> };

// ===== Engine Integration =====
export interface EngineNote { 
  time: Seconds; 
  duration: Seconds; 
  midi: number; 
  velocity: number; 
  channel: ID; 
}

export interface AudioEngine {
  setTransport(opts: { bpm?: number; playing?: boolean; position?: Seconds }): void;
  scheduleNotes(notes: EngineNote[], when: Seconds): void;     // idempotent batch
  scheduleAutomation(points: { target: AutomationTarget; time: Seconds; value: number; }[]): void;
  loadInstrument(def: InstrumentDef): Promise<ID>;
  connectChannelToBus(channelId: ID, busId: ID): void;
  getCurrentTime(): Seconds;
}

// Legacy compatibility types
export type NoteEvent = Note;
export type Clip = PatternClip;
export type Track = PlaylistTrack;
export type TimeSignature = [number, number];
export type Song = Project;

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
