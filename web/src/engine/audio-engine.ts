import * as Tone from 'tone';
import type { 
  AudioEngine, 
  EngineNote, 
  InstrumentDef, 
  AutomationTarget, 
  ID, 
  Seconds 
} from './types';

// Master bus + limiter
let masterBus: Tone.Gain | null = null;
let masterLim: Tone.Limiter | null = null;

function getMasterBus(): Tone.Gain {
  if (!masterBus) {
    masterBus = new Tone.Gain(1);
  }
  if (!masterLim) {
    masterLim = new Tone.Limiter(-1).toDestination();
    masterBus.connect(masterLim);
  }
  return masterBus;
}

// Instrument registry and per-channel nodes
type InstrumentChain = {
  instrument: Tone.Synth | Tone.Sampler;
  panner: Tone.Panner;
  dryGain: Tone.Gain; // controls overall gain (mapped from gainDb)
  reverbSend: Tone.Gain; // 0..1
  delaySend: Tone.Gain;  // 0..1
};
const instruments = new Map<ID, InstrumentChain>();
type InsertChain = {
  input: Tone.Gain;
  effects: Tone.ToneAudioNode[];
  widener: Tone.StereoWidener;
  panner: Tone.Panner;
  fader: Tone.Gain;
  meter: Tone.Meter;
  sends: Map<ID, Tone.Gain>;
};
const inserts = new Map<ID, InsertChain>();
const instrumentInsert = new Map<ID, ID>();

// Channel routing
const channelRouting = new Map<ID, ID>(); // channelId -> busId

// Event scheduling
let scheduledEvents: Map<string, Tone.TransportEvent> = new Map();

// Global effect buses
let reverbBus: Tone.Reverb | null = null;
let delayBus: Tone.FeedbackDelay | null = null;

function ensureFxBuses() {
  if (!reverbBus) {
    reverbBus = new Tone.Reverb({ decay: 2.5, wet: 1 });
    reverbBus.connect(getMasterBus());
  }
  if (!delayBus) {
    delayBus = new Tone.FeedbackDelay({ delayTime: 0.35, feedback: 0.35, wet: 1 });
    delayBus.connect(getMasterBus());
  }
}

export class ToneAudioEngine implements AudioEngine {
  private started = false;

  constructor() {
    // Initialize Tone.js
    this.init();
  }

  private async init() {
    try {
      await Tone.start();
      this.started = true;
      console.log('Audio engine initialized');
      ensureFxBuses();
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  }

  setTransport(opts: { bpm?: number; playing?: boolean; position?: Seconds }): void {
    if (opts.bpm !== undefined) {
      Tone.Transport.bpm.value = opts.bpm;
    }
    
    if (opts.playing !== undefined) {
      if (opts.playing) {
        Tone.Transport.start();
      } else {
        Tone.Transport.pause();
      }
    }
    
    if (opts.position !== undefined) {
      Tone.Transport.position = opts.position;
    }
  }

  scheduleNotes(notes: EngineNote[], when: Seconds): void {
    // Clear existing scheduled notes for this batch
    const batchId = `notes_${Date.now()}`;
    const existing = scheduledEvents.get(batchId);
    if (existing) {
      Tone.Transport.clear(existing);
    }

    const event = Tone.Transport.schedule((time) => {
      notes.forEach(note => {
        const chain = instruments.get(note.channel);
        if (chain) {
          const freq = Tone.Frequency(note.midi, "midi");
          const duration = Tone.Time(note.duration).toSeconds();
          
          chain.instrument.triggerAttackRelease(freq, duration, time, note.velocity);
        }
      });
    }, when);

    scheduledEvents.set(batchId, event);
  }

  scheduleAutomation(points: { target: AutomationTarget; time: Seconds; value: number; }[]): void {
    points.forEach(point => {
      const event = Tone.Transport.schedule((time) => {
        // Handle automation based on target type
        switch (point.target.type) {
          case 'mixer':
            if (point.target.channelId) {
              const channel = this.getMixerChannel(point.target.channelId);
              if (channel && point.target.param === 'gain') {
                channel.gain.setValueAtTime(point.value, time);
              }
            }
            break;
          case 'instrument':
            if (point.target.channelId) {
              const instrument = instruments.get(point.target.channelId);
              if (instrument && point.target.param === 'volume') {
                instrument.volume.setValueAtTime(point.value, time);
              }
            }
            break;
        }
      }, point.time);

      scheduledEvents.set(`automation_${Date.now()}`, event);
    });
  }

  async loadInstrument(def: InstrumentDef): Promise<ID> {
    const instrumentId = def.id;
    ensureFxBuses();
    
    try {
      let instrument: Tone.Synth | Tone.Sampler;

      switch (def.type) {
        case 'synth':
          instrument = new Tone.Synth({
            oscillator: {
              type: def.params.oscillatorType || 'triangle'
            },
            envelope: {
              attack: def.params.attack || 0.1,
              decay: def.params.decay || 0.2,
              sustain: def.params.sustain || 0.3,
              release: def.params.release || 1
            }
          });
          break;

        case 'sampler':
          if (def.params.url) {
            instrument = new Tone.Sampler({
              urls: def.params.url,
              baseUrl: def.params.baseUrl || ''
            });
          } else {
            // Fallback to synth if no sample URL
            instrument = new Tone.Synth();
          }
          break;

        default:
          instrument = new Tone.Synth();
      }

      // Build instrument chain
      const panner = new Tone.Panner(0);
      const dryGain = new Tone.Gain(1);
      const reverbSend = new Tone.Gain(0);
      const delaySend = new Tone.Gain(0);

      // Wiring: instrument -> panner -> dryGain -> master
      //                      \-> reverbSend -> ReverbBus -> master
      //                      \-> delaySend  -> DelayBus  -> master
      instrument.connect(panner);
      panner.connect(dryGain);
      // Route to insert if set, else to master
      const targetInsert = instrumentInsert.get(instrumentId);
      if (targetInsert && inserts.get(targetInsert)) {
        dryGain.connect(inserts.get(targetInsert)!.input);
      } else {
        dryGain.connect(getMasterBus());
      }

      // Sends
      panner.connect(reverbSend);
      reverbSend.connect(reverbBus!);
      panner.connect(delaySend);
      delaySend.connect(delayBus!);

      // Store chain
      instruments.set(instrumentId, { instrument, panner, dryGain, reverbSend, delaySend });
      
      return instrumentId;
    } catch (error) {
      console.error('Failed to load instrument:', error);
      throw error;
    }
  }

  connectChannelToBus(channelId: ID, busId: ID): void {
    channelRouting.set(channelId, busId);
    
    // In a full implementation, you'd create mixer channels and buses
    // For now, we'll just track the routing
    console.log(`Connected channel ${channelId} to bus ${busId}`);
  }

  // Insert management
  private ensureInsert(id: ID): InsertChain {
    let chain = inserts.get(id);
    if (chain) return chain;

    const input = new Tone.Gain(1);
    const effects: Tone.ToneAudioNode[] = [];
    const widener = new Tone.StereoWidener(0);
    const panner = new Tone.Panner(0);
    const fader = new Tone.Gain(1);
    const meter = new Tone.Meter({ channels: 2, normalRange: true });
    const sends = new Map<ID, Tone.Gain>();

    let last: Tone.ToneAudioNode = input;
    // Effects chain placeholder (effects array is managed elsewhere)
    last.connect(widener);
    widener.connect(panner);
    panner.connect(fader);
    fader.connect(meter);
    meter.connect(getMasterBus());

    chain = { input, effects, widener, panner, fader, meter, sends };
    inserts.set(id, chain);
    return chain;
  }

  updateMixer(mixer: { channels: Record<ID, any>; masterId: ID }): void {
    Object.keys(mixer.channels).forEach((id) => {
      const ch = this.ensureInsert(id as ID);
      const data = mixer.channels[id];
      const busGain = Math.pow(10, (data.gainDb ?? 0) / 20) * (data.phaseInvert ? -1 : 1);
      ch.fader.gain.value = busGain;
      ch.panner.pan.value = data.pan ?? 0;
      ch.widener.width.value = data.stereoSeparation ?? 0;
    });

    // Recreate sends per channel
    Object.keys(mixer.channels).forEach((id) => {
      const data = mixer.channels[id];
      const ch = this.ensureInsert(id as ID);
      ch.sends.forEach((gain) => {
        try { gain.disconnect(); } catch {}
      });
      ch.sends.clear();
      (data.sends || []).forEach((s: any) => {
        const sendGain = new Tone.Gain(Math.max(0, Math.min(1, s.amount || 0)));
        ch.fader.connect(sendGain);
        const target = this.ensureInsert(s.targetBusId as ID);
        sendGain.connect(target.input);
        ch.sends.set(s.targetBusId as ID, sendGain);
      });
    });
  }

  setInstrumentInsert(instrumentId: ID, insertId: ID) {
    instrumentInsert.set(instrumentId, insertId);
    const chain = instruments.get(instrumentId);
    if (!chain) return;
    try { chain.dryGain.disconnect(); } catch {}
    const target = inserts.get(insertId);
    if (target) {
      chain.dryGain.connect(target.input);
    } else {
      chain.dryGain.connect(getMasterBus());
    }
  }

  getInsertLevel(id: ID): number {
    const ch = inserts.get(id);
    if (!ch) return 0;
    const v = ch.meter.getValue() as number | number[];
    const val = Array.isArray(v) ? Math.max(v[0] as number, v[1] as number) : (v as number);
    return typeof val === 'number' ? val : 0;
  }

  getCurrentTime(): Seconds {
    return Tone.Transport.seconds;
  }

  // Helper methods
  private getMixerChannel(channelId: ID): Tone.Gain | null {
    // In a full implementation, you'd have a mixer channel registry
    // For now, return null
    return null;
  }

  // Mixer updates
  setInstrumentGainDb(instrumentId: ID, gainDb: number) {
    const chain = instruments.get(instrumentId);
    if (!chain) return;
    const linear = Math.pow(10, gainDb / 20);
    chain.dryGain.gain.value = linear;
  }

  setInstrumentPan(instrumentId: ID, pan: number) {
    const chain = instruments.get(instrumentId);
    if (!chain) return;
    chain.panner.pan.value = Math.max(-1, Math.min(1, pan));
  }

  setInstrumentReverbSend(instrumentId: ID, amount: number) {
    const chain = instruments.get(instrumentId);
    if (!chain) return;
    chain.reverbSend.gain.value = Math.max(0, Math.min(1, amount));
  }

  setInstrumentDelaySend(instrumentId: ID, amount: number) {
    const chain = instruments.get(instrumentId);
    if (!chain) return;
    chain.delaySend.gain.value = Math.max(0, Math.min(1, amount));
  }

  // Cleanup
  dispose() {
    // Clear all scheduled events
    scheduledEvents.forEach(event => {
      Tone.Transport.clear(event);
    });
    scheduledEvents.clear();

    // Dispose instruments
    instruments.forEach(chain => {
      chain.instrument.dispose();
      chain.panner.dispose();
      chain.dryGain.dispose();
      chain.reverbSend.dispose();
      chain.delaySend.dispose();
    });
    instruments.clear();

    // Dispose master bus
    if (masterBus) {
      masterBus.dispose();
      masterBus = null;
    }
    if (masterLim) {
      masterLim.dispose();
      masterLim = null;
    }
    if (reverbBus) {
      reverbBus.dispose();
      reverbBus = null;
    }
    if (delayBus) {
      delayBus.dispose();
      delayBus = null;
    }
  }
}

// Create and export singleton instance
export const audioEngine = new ToneAudioEngine();

// Legacy compatibility
export function createEngine() {
  return {
    setBpm: (bpm: number) => audioEngine.setTransport({ bpm }),
    setTimeSignature: (ts: [number, number]) => {
      // Tone.js doesn't have direct time signature setting
      console.log('Time signature set to:', ts);
    },
    load: (project: any) => {
      // Load project into audio engine
      console.log('Loading project:', project);
    },
    play: () => audioEngine.setTransport({ playing: true }),
    pause: () => audioEngine.setTransport({ playing: false }),
    stop: () => {
      audioEngine.setTransport({ playing: false, position: 0 });
    },
    onNotePlay: (callback: (event: any) => void) => {
      // Set up note play callback
      console.log('Note play callback registered');
    },
    offNotePlay: (callback: (event: any) => void) => {
      // Remove note play callback
      console.log('Note play callback removed');
    },
    previewPreset: (preset: any) => {
      // Preview preset
      console.log('Previewing preset:', preset);
    },
    setTrackPreset: (trackIndex: number, presetId: string) => {
      // Set track preset
      console.log('Setting track preset:', trackIndex, presetId);
    }
  };
}
