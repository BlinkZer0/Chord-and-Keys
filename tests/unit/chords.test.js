import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChord, chordToMidi } from '../src/theory/chords.js';

test('buildChord forms minor triad', () => {
  assert.deepStrictEqual(buildChord('C', 'Min'), ['C', 'D#', 'G']);
});

test('buildChord defaults to major for unknown quality', () => {
  assert.deepStrictEqual(buildChord('C', 'Crazy'), ['C', 'E', 'G']);
});

test('buildChord returns empty array for invalid root', () => {
  assert.deepStrictEqual(buildChord('H', 'Min'), []);
});

test('chordToMidi converts notes to midi numbers', async () => {
  const midi = await chordToMidi(['C', 'E', 'G'], 'C', 4);
  assert.deepStrictEqual(midi, [55, 60, 64]);
});

test('chordToMidi returns empty array for invalid root', async () => {
  const midi = await chordToMidi(['C', 'E', 'G'], 'H', 4);
  assert.deepStrictEqual(midi, []);
});
