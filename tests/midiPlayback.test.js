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

  it('schedules all notes in a 40-bar sequence without truncation', function() {
    const midi = new Midi();
    midi.header.setTempo(120);
    const track = midi.addTrack();
    for (let i = 0; i < 160; i++) {
      track.addNote({
        midi: 60,
        time: i * 0.5,
        duration: 0.5
      });
    }
    const midiData = midi.toArray();
    const imported = new Midi(midiData);
    const { events, finalEnd } = simulatePlayback(imported);
    expect(events.length).to.equal(160);
    expect(finalEnd).to.be.closeTo(imported.duration, 1e-6);
  });
});

// Simulate the dynamic scheduling logic from scheduleSong / scheduleAhead
function simulateDynamicScheduling(totalBars, notesPerBar) {
  const ppq = 480;
  const ts = { num: 4, den: 4 };
  const ticksPerBeat = ppq * (4 / ts.den);
  const ticksPerBar = ticksPerBeat * ts.num;
  notesPerBar = notesPerBar ?? ts.num;

  const totalNotes = totalBars * notesPerBar;
  const songEndTick = totalBars * ticksPerBar;
  const MAX_SCHEDULE_AHEAD_BARS = 256;
  const scheduleAheadBars = Math.min(MAX_SCHEDULE_AHEAD_BARS, Math.max(16, Math.ceil(totalBars * 0.25)));

  let scheduledUntil = 0;
  let scheduledNotes = 0;
  function scheduleWindow(currentTick) {
    const endTick = Math.min(songEndTick, currentTick + ticksPerBar * scheduleAheadBars);
    const startBar = Math.floor(currentTick / ticksPerBar);
    const endBar = Math.floor((endTick - 1) / ticksPerBar);
    const barsInWindow = endBar - startBar + 1;
    scheduledNotes += barsInWindow * notesPerBar;
    scheduledUntil = endTick;
  }

  scheduleWindow(0);
  while (scheduledUntil < songEndTick) {
    scheduleWindow(scheduledUntil);
  }

  const buffer = 192;
  const autoStopTick = songEndTick + buffer;
  return { scheduleAheadBars, scheduledUntil, songEndTick, scheduledNotes, totalNotes, autoStopTick };
}

describe('Dynamic scheduling window', function() {
  it('covers entire 40-bar song and computes auto-stop correctly', function() {
    const result = simulateDynamicScheduling(40);
    expect(result.scheduleAheadBars).to.be.at.least(16);
    expect(result.scheduledUntil).to.equal(result.songEndTick);
    expect(result.scheduledNotes).to.equal(result.totalNotes);
    expect(result.autoStopTick).to.be.above(result.songEndTick);
  });

  it('handles 1,048,576 bars with sparse notes and schedules all events', function() {
    this.timeout(10000);
    const bars = 1048576;
    const result = simulateDynamicScheduling(bars, 1);
    expect(result.scheduleAheadBars).to.equal(256);
    expect(result.totalNotes).to.equal(bars);
    expect(result.scheduledNotes).to.equal(result.totalNotes);
    expect(result.autoStopTick).to.be.above(result.songEndTick);
  });
});
