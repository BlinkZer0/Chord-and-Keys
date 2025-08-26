import { expect } from 'chai';
import MidiPkg from '@tonejs/midi';
const { Midi } = MidiPkg;

function simulatePlayback(midi) {
  const events = [];
  midi.tracks.forEach(track => {
    track.notes.forEach(note => {
      events.push({
        start: note.time,
        end: note.time + note.duration
      });
    });
  });
  events.sort((a, b) => a.start - b.start);
  const finalEnd = events.reduce((max, e) => Math.max(max, e.end), 0);
  return { events, finalEnd };
}

describe('MIDI playback scheduling', function() {
  it('schedules all notes in a 4-bar sequence without truncation', function() {
    const midi = new Midi();
    midi.header.setTempo(120);
    const track = midi.addTrack();
    for (let i = 0; i < 16; i++) {
      track.addNote({
        midi: 60,
        time: i * 0.5,
        duration: 0.5
      });
    }
    const midiData = midi.toArray();
    const imported = new Midi(midiData);
    const { events, finalEnd } = simulatePlayback(imported);
    expect(events.length).to.equal(16);
    expect(finalEnd).to.be.closeTo(imported.duration, 1e-6);
  });
});
