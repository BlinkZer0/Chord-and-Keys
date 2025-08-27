import * as Tone from 'tone';
import { Engine, Song, TimeSignature } from './types';

export function createEngine(): Engine {
  let current: Song | null = null;
  const limiter = new Tone.Limiter(-1).toDestination();

  function schedule(song: Song) {
    Tone.Transport.cancel();
    Tone.Transport.PPQ = song.ppq;
    Tone.Transport.bpm.value = song.bpm;
    Tone.Transport.timeSignature = [song.ts.num, song.ts.den] as any;

    const ticksPerBeat = song.ppq * (4 / song.ts.den);

    for (const track of song.tracks) {
      if (track.mute) continue;
      const synth = new Tone.PolySynth(Tone.Synth).connect(limiter);
      synth.set({ volume: ((track.volume ?? 0.8) - 1) * 12 });
      for (const cl of track.clips) {
        for (const n of cl.notes) {
          const startBeats = (cl.start + n.tick) / ticksPerBeat;
          const durBeats = n.dur / ticksPerBeat;
          Tone.Transport.schedule((time) => {
            try {
              const freq = Tone.Frequency(n.midi, 'midi');
              synth.triggerAttackRelease(freq, durBeats + 'i', time, n.vel ?? 0.9);
            } catch {}
          }, startBeats + 'i');
        }
      }
    }
  }

  return {
    setBpm(bpm: number) {
      Tone.Transport.bpm.value = bpm;
      if (current) current.bpm = bpm;
    },
    setTimeSignature(ts: TimeSignature) {
      Tone.Transport.timeSignature = [ts.num, ts.den] as any;
      if (current) current.ts = ts;
    },
    load(song: Song) {
      current = song;
      schedule(song);
    },
    play() { Tone.start(); Tone.Transport.start(); },
    pause() { Tone.Transport.pause(); },
    stop() { Tone.Transport.stop(); Tone.Transport.cancel(); if (current) schedule(current); },
  };
}

