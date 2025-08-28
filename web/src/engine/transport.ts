import * as Tone from 'tone';
import { Engine, Song, TimeSignature } from './types';

export function createEngine(): Engine {
  let current: Song | null = null;
  let limiter: Tone.Limiter | null = null;
  let isInitialized = false;

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

      for (const track of song.tracks) {
        if (track.mute) continue;
        const synth = new Tone.PolySynth(Tone.Synth).connect(limiter!);
        synth.set({ volume: ((track.volume ?? 0.8) - 1) * 12 });
        
        for (const cl of track.clips) {
          for (const n of cl.notes) {
            const startBeats = (cl.start + n.tick) / ticksPerBeat;
            const durBeats = n.dur / ticksPerBeat;
            Tone.Transport.schedule((time) => {
              try {
                const freq = Tone.Frequency(n.midi, 'midi');
                synth.triggerAttackRelease(freq, durBeats + 'i', time, n.vel ?? 0.9);
              } catch (error) {
                console.error('Error triggering note:', error);
              }
            }, startBeats + 'i');
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
  };
}

