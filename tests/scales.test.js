import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScale, scaleToMidi } from '../src/theory/scales.js';

test('buildScale generates Dorian mode', () => {
  assert.deepStrictEqual(buildScale('C', 'Dorian'), ['C', 'D', 'D#', 'F', 'G', 'A', 'A#']);
});

test('buildScale handles quarter-tone maqam', () => {
  assert.deepStrictEqual(buildScale('C', 'Maqam Rast'), ['C', 'D', 'D#+', 'F', 'G', 'A', 'A#+']);
});

test('buildScale returns empty array for invalid tonic', () => {
  assert.deepStrictEqual(buildScale('H', 'Ionian'), []);
});

test('scaleToMidi converts scale to midi numbers', async () => {
  const notes = buildScale('C', 'Ionian');
  const midi = await scaleToMidi(notes, 'C', 4);
  assert.deepStrictEqual(midi.slice(0, 4), [60, 62, 64, 65]);
});
