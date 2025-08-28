import test from 'node:test';
import assert from 'node:assert/strict';
import { pcIndex, pcName, midiFrom } from '../src/theory/notes.js';

test('pcIndex handles quarter-tones', () => {
  assert.strictEqual(pcIndex('C+'), 0.5);
});

test('pcIndex returns null for invalid note', () => {
  assert.strictEqual(pcIndex('H'), null);
});

test('pcName wraps negative values', () => {
  assert.strictEqual(pcName(-1), 'B');
});

test('midiFrom returns expected value', () => {
  assert.strictEqual(midiFrom('A', 4), 69);
});

test('midiFrom returns null for invalid note', () => {
  assert.strictEqual(midiFrom('H'), null);
});
