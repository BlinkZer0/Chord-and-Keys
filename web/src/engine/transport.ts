import * as Tone from 'tone';
import { Engine, Song, TimeSignature } from './types';
import { SynthPreset, SYNTH_PRESETS } from './synth-presets';

// Custom event for note playback
export interface NotePlayEvent {
  midi: number;
  startTime: number;
  duration: number;
  trackIndex: number;
}

export function createEngine(): Engine {
  let current: Song | null = null;
  let limiter: Tone.Limiter | null = null;
  let isInitialized = false;
  let noteEventListeners: ((event: NotePlayEvent) => void)[] = [];
  let presetInstruments = new Map<string, any>();
  let previewInstrument: any = null;

  async function initializeAudio() {
    if (isInitialized) return;
    
    try {
      await Tone.start();
      limiter = new Tone.Limiter(-1).toDestination();
      isInitialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  function schedule(song: Song) {
    if (!isInitialized) {
      console.warn('Audio not initialized, scheduling will be delayed');
      return;
    }

    try {
      Tone.Transport.cancel();
      Tone.Transport.PPQ = song.ppq;
      Tone.Transport.bpm.value = song.bpm;
      Tone.Transport.timeSignature = [song.ts.num, song.ts.den] as any;

      const ticksPerBeat = song.ppq * (4 / song.ts.den);

      for (let trackIndex = 0; trackIndex < song.tracks.length; trackIndex++) {
        const track = song.tracks[trackIndex];
        if (track.mute) continue;
        
        // Get or create instrument for this track
        let synth: any;
        if (track.presetId) {
          const preset = SYNTH_PRESETS.find(p => p.id === track.presetId);
          if (preset) {
            synth = preset.factory();
            synth.connect(limiter!);
            synth.set({ volume: ((track.volume ?? 0.8) - 1) * 12 });
          } else {
            // Fallback to default synth
            synth = new Tone.PolySynth(Tone.Synth).connect(limiter!);
            synth.set({ volume: ((track.volume ?? 0.8) - 1) * 12 });
          }
        } else {
          // Default synth
          synth = new Tone.PolySynth(Tone.Synth).connect(limiter!);
          synth.set({ volume: ((track.volume ?? 0.8) - 1) * 12 });
        }
        
        for (const cl of track.clips) {
          // Sort notes by tick to find next notes for slides
          const sortedNotes = [...cl.notes].sort((a, b) => a.tick - b.tick);
          
          for (let noteIndex = 0; noteIndex < sortedNotes.length; noteIndex++) {
            const n = sortedNotes[noteIndex];
            const startBeats = (cl.start + n.tick) / ticksPerBeat;
            const durBeats = n.dur / ticksPerBeat;
            
            // Find the next note for slide functionality
            const nextNote = noteIndex < sortedNotes.length - 1 ? sortedNotes[noteIndex + 1] : null;
            const nextNoteStartsAfterCurrent = nextNote && (nextNote.tick > n.tick);
            
            if (n.slide && nextNote && nextNoteStartsAfterCurrent) {
              // Handle slide note - create multiple steps for pitch bend
              const steps = Math.max(4, Math.min(24, Math.floor(n.dur / Math.max(1, song.ppq / 8))));
              
              for (let step = 0; step < steps; step++) {
                const progress = step / steps;
                const midi = Math.round(n.midi + (nextNote.midi - n.midi) * progress);
                const stepStart = startBeats + (durBeats * step) / steps;
                const stepDuration = Math.max(0.01, durBeats / steps);
                
                Tone.Transport.schedule((time) => {
                  try {
                    const freq = Tone.Frequency(midi, 'midi');
                    synth.triggerAttackRelease(freq, stepDuration + 'i', time, n.vel ?? 0.9);
                    
                    // Emit note play event for each step
                    const event: NotePlayEvent = {
                      midi: midi,
                      startTime: time,
                      duration: stepDuration,
                      trackIndex: trackIndex
                    };
                    noteEventListeners.forEach(listener => listener(event));
                  } catch (error) {
                    console.error('Error triggering slide note step:', error);
                  }
                }, stepStart + 'i');
              }
            } else {
              // Regular note scheduling
              Tone.Transport.schedule((time) => {
                try {
                  const freq = Tone.Frequency(n.midi, 'midi');
                  synth.triggerAttackRelease(freq, durBeats + 'i', time, n.vel ?? 0.9);
                  
                  // Emit note play event
                  const event: NotePlayEvent = {
                    midi: n.midi,
                    startTime: time,
                    duration: durBeats,
                    trackIndex: trackIndex
                  };
                  noteEventListeners.forEach(listener => listener(event));
                } catch (error) {
                  console.error('Error triggering note:', error);
                }
              }, startBeats + 'i');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling song:', error);
    }
  }

  return {
    setBpm(bpm: number) {
      try {
        Tone.Transport.bpm.value = bpm;
        if (current) current.bpm = bpm;
      } catch (error) {
        console.error('Error setting BPM:', error);
      }
    },
    setTimeSignature(ts: TimeSignature) {
      try {
        Tone.Transport.timeSignature = [ts.num, ts.den] as any;
        if (current) current.ts = ts;
      } catch (error) {
        console.error('Error setting time signature:', error);
      }
    },
    load(song: Song) {
      current = song;
      schedule(song);
    },
    async play() { 
      await initializeAudio();
      try {
        Tone.Transport.start();
      } catch (error) {
        console.error('Error starting transport:', error);
      }
    },
    pause() { 
      try {
        Tone.Transport.pause(); 
      } catch (error) {
        console.error('Error pausing transport:', error);
      }
    },
    stop() { 
      try {
        Tone.Transport.stop(); 
        Tone.Transport.cancel(); 
        if (current) schedule(current); 
      } catch (error) {
        console.error('Error stopping transport:', error);
      }
    },
    onNotePlay(callback: (event: NotePlayEvent) => void) {
      noteEventListeners.push(callback);
    },
    offNotePlay(callback: (event: NotePlayEvent) => void) {
      const index = noteEventListeners.indexOf(callback);
      if (index > -1) {
        noteEventListeners.splice(index, 1);
      }
    },
    previewPreset(preset: SynthPreset) {
      try {
        // Stop any existing preview
        if (previewInstrument) {
          previewInstrument.dispose();
        }
        
        // Create new preview instrument
        previewInstrument = preset.factory();
        previewInstrument.connect(limiter!);
        
        // Play a test note
        const freq = Tone.Frequency('C4', 'midi');
        previewInstrument.triggerAttackRelease(freq, '1n', Tone.now(), 0.7);
        
        // Auto-dispose after 2 seconds
        setTimeout(() => {
          if (previewInstrument) {
            previewInstrument.dispose();
            previewInstrument = null;
          }
        }, 2000);
      } catch (error) {
        console.error('Error previewing preset:', error);
      }
    },
    setTrackPreset(trackIndex: number, presetId: string) {
      if (current && current.tracks[trackIndex]) {
        current.tracks[trackIndex].presetId = presetId;
        // Re-schedule if playing
        if (Tone.Transport.state === 'started') {
          schedule(current);
        }
      }
    }
  };
}

