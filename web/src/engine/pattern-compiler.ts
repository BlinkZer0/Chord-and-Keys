import type { 
  Pattern, 
  PatternClip, 
  EngineNote, 
  Project, 
  Ticks, 
  Seconds,
  ID 
} from './types';

// Utility functions for time conversion
export function ticksToSeconds(ticks: Ticks, ppq: number, bpm: number): Seconds {
  const beatsPerSecond = bpm / 60;
  const ticksPerSecond = beatsPerSecond * ppq;
  return ticks / ticksPerSecond;
}

export function secondsToTicks(seconds: Seconds, ppq: number, bpm: number): Ticks {
  const beatsPerSecond = bpm / 60;
  const ticksPerSecond = beatsPerSecond * ppq;
  return seconds * ticksPerSecond;
}

export class PatternCompiler {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  /**
   * Compile a pattern into engine notes
   */
  compilePattern(pattern: Pattern, startTime: Ticks = 0): EngineNote[] {
    const notes: EngineNote[] = [];
    const { ppq, bpm } = this.project;

    pattern.channels.forEach(channel => {
      if (channel.mute) return;

      // Compile notes from piano roll
      if (channel.notes) {
        channel.notes.forEach(note => {
          const engineNote: EngineNote = {
            time: ticksToSeconds(startTime + note.time, ppq, bpm),
            duration: ticksToSeconds(note.length, ppq, bpm),
            midi: note.pitch,
            velocity: note.velocity,
            channel: channel.instrumentId
          };
          notes.push(engineNote);
        });
      }

      // Compile steps from step sequencer
      if (channel.steps) {
        const stepDuration = pattern.length / pattern.resolution;
        channel.steps.forEach(step => {
          const stepTime = step.stepIndex * stepDuration;
          const noteLength = (step.lengthSteps || 1) * stepDuration;
          
          const engineNote: EngineNote = {
            time: ticksToSeconds(startTime + stepTime, ppq, bpm),
            duration: ticksToSeconds(noteLength, ppq, bpm),
            midi: 60, // Default to middle C - in a real implementation, you'd have step pitch data
            velocity: step.velocity,
            channel: channel.instrumentId
          };
          notes.push(engineNote);
        });
      }
    });

    return notes;
  }

  /**
   * Compile a pattern clip into engine notes
   */
  compilePatternClip(clip: PatternClip, startTime: Ticks = 0): EngineNote[] {
    const pattern = this.project.patterns[clip.patternId];
    if (!pattern) {
      console.warn(`Pattern ${clip.patternId} not found`);
      return [];
    }

    const notes: EngineNote[] = [];
    const { ppq, bpm } = this.project;

    // Calculate how many times the pattern should loop
    const patternLength = pattern.length;
    const clipLength = clip.length;
    const loopCount = Math.ceil(clipLength / patternLength);

    for (let loop = 0; loop < loopCount; loop++) {
      const loopStart = startTime + clip.start + (loop * patternLength);
      const loopEnd = loopStart + patternLength;
      const clipEnd = startTime + clip.start + clipLength;

      // Don't exceed clip boundaries
      if (loopStart >= clipEnd) break;

      const effectivePatternLength = Math.min(patternLength, clipEnd - loopStart);
      
      pattern.channels.forEach(channel => {
        if (channel.mute) return;

        // Apply channel overrides if specified
        const overrides = clip.channelOverrides?.[channel.id];
        const effectiveChannel = overrides ? { ...channel, ...overrides } : channel;

        // Compile notes from piano roll
        if (effectiveChannel.notes) {
          effectiveChannel.notes.forEach(note => {
            // Check if note is within the effective pattern length
            if (note.time >= effectivePatternLength) return;

            const noteEnd = note.time + note.length;
            if (noteEnd <= 0) return;

            // Clip note to pattern boundaries
            const clippedStart = Math.max(0, note.time);
            const clippedEnd = Math.min(effectivePatternLength, noteEnd);
            const clippedLength = clippedEnd - clippedStart;

            if (clippedLength <= 0) return;

            const engineNote: EngineNote = {
              time: ticksToSeconds(loopStart + clippedStart, ppq, bpm),
              duration: ticksToSeconds(clippedLength, ppq, bpm),
              midi: note.pitch + (clip.transpose || 0),
              velocity: note.velocity * (clip.gainDb ? Math.pow(10, clip.gainDb / 20) : 1),
              channel: effectiveChannel.instrumentId
            };
            notes.push(engineNote);
          });
        }

        // Compile steps from step sequencer
        if (effectiveChannel.steps) {
          const stepDuration = pattern.length / pattern.resolution;
          effectiveChannel.steps.forEach(step => {
            const stepTime = step.stepIndex * stepDuration;
            const stepEnd = stepTime + (step.lengthSteps || 1) * stepDuration;

            // Check if step is within the effective pattern length
            if (stepTime >= effectivePatternLength || stepEnd <= 0) return;

            // Clip step to pattern boundaries
            const clippedStart = Math.max(0, stepTime);
            const clippedEnd = Math.min(effectivePatternLength, stepEnd);
            const clippedLength = clippedEnd - clippedStart;

            if (clippedLength <= 0) return;

            const engineNote: EngineNote = {
              time: ticksToSeconds(loopStart + clippedStart, ppq, bpm),
              duration: ticksToSeconds(clippedLength, ppq, bpm),
              midi: 60 + (clip.transpose || 0), // Default to middle C + transpose
              velocity: step.velocity * (clip.gainDb ? Math.pow(10, clip.gainDb / 20) : 1),
              channel: effectiveChannel.instrumentId
            };
            notes.push(engineNote);
          });
        }
      });
    }

    return notes;
  }

  /**
   * Compile all clips in a time window for song mode
   */
  compileSongWindow(from: Ticks, to: Ticks): EngineNote[] {
    const notes: EngineNote[] = [];

    Object.values(this.project.clips).forEach(clip => {
      // Check if clip overlaps with the time window
      const clipStart = clip.start;
      const clipEnd = clip.start + clip.length;

      if (clipEnd <= from || clipStart >= to) return;

      if (clip.type === 'pattern') {
        const patternNotes = this.compilePatternClip(clip, 0);
        notes.push(...patternNotes);
      }
      // Audio and automation clips would be handled separately
    });

    return notes;
  }

  /**
   * Compile a single pattern for pattern mode
   */
  compilePatternMode(patternId: ID): EngineNote[] {
    const pattern = this.project.patterns[patternId];
    if (!pattern) {
      console.warn(`Pattern ${patternId} not found`);
      return [];
    }

    return this.compilePattern(pattern);
  }

  /**
   * Get all unique instrument IDs used in a pattern
   */
  getPatternInstruments(pattern: Pattern): ID[] {
    const instruments = new Set<ID>();
    pattern.channels.forEach(channel => {
      if (!channel.mute) {
        instruments.add(channel.instrumentId);
      }
    });
    return Array.from(instruments);
  }

  /**
   * Get all unique instrument IDs used in a pattern clip
   */
  getClipInstruments(clip: PatternClip): ID[] {
    const pattern = this.project.patterns[clip.patternId];
    if (!pattern) return [];

    const instruments = new Set<ID>();
    pattern.channels.forEach(channel => {
      if (!channel.mute) {
        instruments.add(channel.instrumentId);
      }
    });
    return Array.from(instruments);
  }
}
