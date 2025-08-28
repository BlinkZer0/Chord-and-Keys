import * as Tone from 'tone';

export interface SynthPreset {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  type: 'synth' | 'sampler' | 'drum';
  factory: () => any;
  tags: string[];
}

// Base synth factory functions
function createPolySynth(options: any = {}): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
    ...options
  });
}

function createMonoSynth(options: any = {}): Tone.MonoSynth {
  return new Tone.MonoSynth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 },
    ...options
  });
}

function createAMSynth(options: any = {}): Tone.AMSynth {
  return new Tone.AMSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 },
    ...options
  });
}

function createFMSynth(options: any = {}): Tone.FMSynth {
  return new Tone.FMSynth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 },
    ...options
  });
}

function createPluckSynth(options: any = {}): Tone.PluckSynth {
  return new Tone.PluckSynth({
    attackNoise: 0.5,
    dampening: 1800,
    resonance: 0.8,
    ...options
  });
}

function createMembraneSynth(options: any = {}): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 },
    ...options
  });
}

function createMetalSynth(options: any = {}): Tone.MetalSynth {
  return new Tone.MetalSynth({
    frequency: 400,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    ...options
  });
}

function createNoiseSynth(options: any = {}): Tone.NoiseSynth {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    ...options
  });
}

// Comprehensive synth preset library
export const SYNTH_PRESETS: SynthPreset[] = [
  // === ANALOG SYNTHS ===
  {
    id: 'analog-warm-pad',
    name: 'Warm Pad',
    category: 'Analog',
    subcategory: 'Pads',
    description: 'Warm analog pad with slow attack and rich harmonics',
    type: 'synth',
    factory: () => createPolySynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 2.0 },
      filter: { frequency: 2000, Q: 0.5, type: 'lowpass' }
    }),
    tags: ['pad', 'warm', 'analog', 'ambient']
  },
  {
    id: 'analog-bass',
    name: 'Analog Bass',
    category: 'Analog',
    subcategory: 'Bass',
    description: 'Fat analog bass with punchy envelope',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 },
      filter: { frequency: 800, Q: 2, type: 'lowpass' }
    }),
    tags: ['bass', 'analog', 'fat', 'punchy']
  },
  {
    id: 'analog-lead',
    name: 'Analog Lead',
    category: 'Analog',
    subcategory: 'Leads',
    description: 'Bright analog lead with quick attack',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.3 },
      filter: { frequency: 4000, Q: 1.5, type: 'lowpass' }
    }),
    tags: ['lead', 'analog', 'bright', 'melodic']
  },

  // === DIGITAL SYNTHS ===
  {
    id: 'digital-bell',
    name: 'Digital Bell',
    category: 'Digital',
    subcategory: 'Bells',
    description: 'Bright digital bell with long decay',
    type: 'synth',
    factory: () => createPolySynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 3.0 },
      filter: { frequency: 8000, Q: 0.3, type: 'highpass' }
    }),
    tags: ['bell', 'digital', 'bright', 'ethereal']
  },
  {
    id: 'digital-pluck',
    name: 'Digital Pluck',
    category: 'Digital',
    subcategory: 'Plucks',
    description: 'Sharp digital pluck with quick decay',
    type: 'synth',
    factory: () => createPluckSynth({
      attackNoise: 0.3,
      dampening: 2000,
      resonance: 0.9
    }),
    tags: ['pluck', 'digital', 'sharp', 'percussive']
  },
  {
    id: 'digital-arp',
    name: 'Digital Arp',
    category: 'Digital',
    subcategory: 'Arpeggios',
    description: 'Bright arpeggio sound with quick envelope',
    type: 'synth',
    factory: () => createPolySynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.2 },
      filter: { frequency: 3000, Q: 1, type: 'lowpass' }
    }),
    tags: ['arpeggio', 'digital', 'bright', 'rhythmic']
  },

  // === FM SYNTHS ===
  {
    id: 'fm-bell',
    name: 'FM Bell',
    category: 'FM',
    subcategory: 'Bells',
    description: 'Complex FM bell with rich harmonics',
    type: 'synth',
    factory: () => createFMSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 2.0 },
      modulationIndex: 10,
      harmonicity: 2.5
    }),
    tags: ['bell', 'fm', 'complex', 'harmonic']
  },
  {
    id: 'fm-bass',
    name: 'FM Bass',
    category: 'FM',
    subcategory: 'Bass',
    description: 'Deep FM bass with modulation',
    type: 'synth',
    factory: () => createFMSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 1.0 },
      modulationIndex: 3,
      harmonicity: 1.5
    }),
    tags: ['bass', 'fm', 'deep', 'modulated']
  },
  {
    id: 'fm-lead',
    name: 'FM Lead',
    category: 'FM',
    subcategory: 'Leads',
    description: 'Bright FM lead with complex timbre',
    type: 'synth',
    factory: () => createFMSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.5 },
      modulationIndex: 8,
      harmonicity: 3.0
    }),
    tags: ['lead', 'fm', 'bright', 'complex']
  },

  // === AM SYNTHS ===
  {
    id: 'am-brass',
    name: 'AM Brass',
    category: 'AM',
    subcategory: 'Brass',
    description: 'Warm AM brass with ring modulation',
    type: 'synth',
    factory: () => createAMSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.8 },
      harmonicity: 2.5
    }),
    tags: ['brass', 'am', 'warm', 'ring-mod']
  },
  {
    id: 'am-strings',
    name: 'AM Strings',
    category: 'AM',
    subcategory: 'Strings',
    description: 'Rich AM strings with modulation',
    type: 'synth',
    factory: () => createAMSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.2, decay: 0.4, sustain: 0.6, release: 1.2 },
      harmonicity: 1.5
    }),
    tags: ['strings', 'am', 'rich', 'modulated']
  },

  // === DRUMS ===
  {
    id: 'kick-808',
    name: 'Kick 808',
    category: 'Drums',
    subcategory: 'Kicks',
    description: 'Classic 808 kick drum',
    type: 'drum',
    factory: () => createMembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 }
    }),
    tags: ['kick', '808', 'classic', 'electronic']
  },
  {
    id: 'kick-punchy',
    name: 'Kick Punchy',
    category: 'Drums',
    subcategory: 'Kicks',
    description: 'Punchy kick with tight envelope',
    type: 'drum',
    factory: () => createMembraneSynth({
      pitchDecay: 0.01,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 }
    }),
    tags: ['kick', 'punchy', 'tight', 'electronic']
  },
  {
    id: 'snare-tight',
    name: 'Snare Tight',
    category: 'Drums',
    subcategory: 'Snares',
    description: 'Tight snare with high-pass noise',
    type: 'drum',
    factory: () => createNoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.01 },
      filter: { frequency: 1800, Q: 1, type: 'highpass' }
    }),
    tags: ['snare', 'tight', 'noise', 'electronic']
  },
  {
    id: 'snare-crack',
    name: 'Snare Crack',
    category: 'Drums',
    subcategory: 'Snares',
    description: 'Crackling snare with band-pass filter',
    type: 'drum',
    factory: () => createNoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 },
      filter: { frequency: 2000, Q: 2, type: 'bandpass' }
    }),
    tags: ['snare', 'crack', 'noise', 'electronic']
  },
  {
    id: 'hihat-closed',
    name: 'Hi-Hat Closed',
    category: 'Drums',
    subcategory: 'Hi-Hats',
    description: 'Closed hi-hat with short decay',
    type: 'drum',
    factory: () => createMetalSynth({
      frequency: 400,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
    }),
    tags: ['hihat', 'closed', 'metal', 'electronic']
  },
  {
    id: 'hihat-open',
    name: 'Hi-Hat Open',
    category: 'Drums',
    subcategory: 'Hi-Hats',
    description: 'Open hi-hat with longer decay',
    type: 'drum',
    factory: () => createMetalSynth({
      frequency: 300,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 }
    }),
    tags: ['hihat', 'open', 'metal', 'electronic']
  },
  {
    id: 'cymbal-ride',
    name: 'Cymbal Ride',
    category: 'Drums',
    subcategory: 'Cymbals',
    description: 'Ride cymbal with long decay',
    type: 'drum',
    factory: () => createMetalSynth({
      frequency: 250,
      envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.5 },
      harmonicity: 5.1,
      resonance: 7000
    }),
    tags: ['cymbal', 'ride', 'metal', 'acoustic']
  },
  {
    id: 'clap-short',
    name: 'Clap Short',
    category: 'Drums',
    subcategory: 'Claps',
    description: 'Short clap with tight envelope',
    type: 'drum',
    factory: () => createNoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.01 },
      filter: { frequency: 1200, Q: 1, type: 'bandpass' }
    }),
    tags: ['clap', 'short', 'noise', 'percussion']
  },
  {
    id: 'clap-wide',
    name: 'Clap Wide',
    category: 'Drums',
    subcategory: 'Claps',
    description: 'Wide clap with longer decay',
    type: 'drum',
    factory: () => createNoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.02 },
      filter: { frequency: 1200, Q: 0.5, type: 'bandpass' }
    }),
    tags: ['clap', 'wide', 'noise', 'percussion']
  },

  // === WORLD PERCUSSION ===
  {
    id: 'conga-hand',
    name: 'Hand Conga',
    category: 'World',
    subcategory: 'Congas',
    description: 'Hand-played conga drum',
    type: 'drum',
    factory: () => createMembraneSynth({
      pitchDecay: 0.008,
      octaves: 1.5,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
    }),
    tags: ['conga', 'hand', 'world', 'percussion']
  },
  {
    id: 'bongo-hand',
    name: 'Hand Bongo',
    category: 'World',
    subcategory: 'Bongos',
    description: 'Hand-played bongo drum',
    type: 'drum',
    factory: () => createMembraneSynth({
      pitchDecay: 0.005,
      octaves: 1.5,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 }
    }),
    tags: ['bongo', 'hand', 'world', 'percussion']
  },
  {
    id: 'tabla-hand',
    name: 'Hand Tabla',
    category: 'World',
    subcategory: 'Tablas',
    description: 'Hand-played tabla drum',
    type: 'drum',
    factory: () => createMembraneSynth({
      pitchDecay: 0.01,
      octaves: 2.5,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.15 }
    }),
    tags: ['tabla', 'hand', 'world', 'percussion']
  },

  // === PADS ===
  {
    id: 'pad-ambient',
    name: 'Ambient Pad',
    category: 'Pads',
    subcategory: 'Ambient',
    description: 'Ethereal ambient pad with long release',
    type: 'synth',
    factory: () => createPolySynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 1.0, decay: 0.5, sustain: 0.8, release: 4.0 },
      filter: { frequency: 1500, Q: 0.3, type: 'lowpass' }
    }),
    tags: ['pad', 'ambient', 'ethereal', 'long-release']
  },
  {
    id: 'pad-choir',
    name: 'Choir Pad',
    category: 'Pads',
    subcategory: 'Choir',
    description: 'Choir-like pad with multiple oscillators',
    type: 'synth',
    factory: () => createPolySynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 2.5 },
      filter: { frequency: 2500, Q: 0.5, type: 'lowpass' }
    }),
    tags: ['pad', 'choir', 'vocal', 'harmonious']
  },
  {
    id: 'pad-strings',
    name: 'String Pad',
    category: 'Pads',
    subcategory: 'Strings',
    description: 'Rich string pad with vibrato',
    type: 'synth',
    factory: () => createPolySynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.3, sustain: 0.6, release: 1.8 },
      filter: { frequency: 3000, Q: 0.8, type: 'lowpass' }
    }),
    tags: ['pad', 'strings', 'rich', 'vibrato']
  },

  // === LEADS ===
  {
    id: 'lead-saw',
    name: 'Saw Lead',
    category: 'Leads',
    subcategory: 'Saw',
    description: 'Bright sawtooth lead with filter',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.4 },
      filter: { frequency: 5000, Q: 2, type: 'lowpass' }
    }),
    tags: ['lead', 'saw', 'bright', 'filtered']
  },
  {
    id: 'lead-square',
    name: 'Square Lead',
    category: 'Leads',
    subcategory: 'Square',
    description: 'Hollow square wave lead',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.3 },
      filter: { frequency: 4000, Q: 1.5, type: 'lowpass' }
    }),
    tags: ['lead', 'square', 'hollow', 'retro']
  },
  {
    id: 'lead-sine',
    name: 'Sine Lead',
    category: 'Leads',
    subcategory: 'Sine',
    description: 'Pure sine wave lead',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
      filter: { frequency: 6000, Q: 1, type: 'lowpass' }
    }),
    tags: ['lead', 'sine', 'pure', 'simple']
  },

  // === BASS ===
  {
    id: 'bass-sub',
    name: 'Sub Bass',
    category: 'Bass',
    subcategory: 'Sub',
    description: 'Deep sub bass with long decay',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 1.5 },
      filter: { frequency: 400, Q: 1, type: 'lowpass' }
    }),
    tags: ['bass', 'sub', 'deep', 'long-decay']
  },
  {
    id: 'bass-acid',
    name: 'Acid Bass',
    category: 'Bass',
    subcategory: 'Acid',
    description: 'Acid-style bass with resonance',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 },
      filter: { frequency: 600, Q: 8, type: 'lowpass' }
    }),
    tags: ['bass', 'acid', 'resonant', 'electronic']
  },
  {
    id: 'bass-wobble',
    name: 'Wobble Bass',
    category: 'Bass',
    subcategory: 'Wobble',
    description: 'Wobble bass with LFO modulation',
    type: 'synth',
    factory: () => createMonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 1.0 },
      filter: { frequency: 800, Q: 4, type: 'lowpass' }
    }),
    tags: ['bass', 'wobble', 'modulated', 'dubstep']
  },

  // === PLUCKS ===
  {
    id: 'pluck-kalimba',
    name: 'Kalimba Pluck',
    category: 'Plucks',
    subcategory: 'Kalimba',
    description: 'Kalimba-like pluck with metallic tone',
    type: 'synth',
    factory: () => createPluckSynth({
      attackNoise: 0.2,
      dampening: 2500,
      resonance: 0.9
    }),
    tags: ['pluck', 'kalimba', 'metallic', 'world']
  },
  {
    id: 'pluck-guitar',
    name: 'Guitar Pluck',
    category: 'Plucks',
    subcategory: 'Guitar',
    description: 'Guitar-like pluck with string resonance',
    type: 'synth',
    factory: () => createPluckSynth({
      attackNoise: 0.5,
      dampening: 1800,
      resonance: 0.8
    }),
    tags: ['pluck', 'guitar', 'string', 'acoustic']
  },
  {
    id: 'pluck-harp',
    name: 'Harp Pluck',
    category: 'Plucks',
    subcategory: 'Harp',
    description: 'Harp-like pluck with long resonance',
    type: 'synth',
    factory: () => createPluckSynth({
      attackNoise: 0.1,
      dampening: 1200,
      resonance: 0.95
    }),
    tags: ['pluck', 'harp', 'resonant', 'ethereal']
  }
];

// Organize presets into a tree structure
export interface PresetCategory {
  name: string;
  subcategories: {
    name: string;
    presets: SynthPreset[];
  }[];
}

export function organizePresets(): PresetCategory[] {
  const categories = new Map<string, Map<string, SynthPreset[]>>();
  
  SYNTH_PRESETS.forEach(preset => {
    if (!categories.has(preset.category)) {
      categories.set(preset.category, new Map());
    }
    
    const category = categories.get(preset.category)!;
    if (!category.has(preset.subcategory)) {
      category.set(preset.subcategory, []);
    }
    
    category.get(preset.subcategory)!.push(preset);
  });
  
  return Array.from(categories.entries()).map(([categoryName, subcategories]) => ({
    name: categoryName,
    subcategories: Array.from(subcategories.entries()).map(([subcategoryName, presets]) => ({
      name: subcategoryName,
      presets
    }))
  }));
}

// Get presets by category and subcategory
export function getPresetsByCategory(category: string, subcategory?: string): SynthPreset[] {
  if (subcategory) {
    return SYNTH_PRESETS.filter(p => p.category === category && p.subcategory === subcategory);
  }
  return SYNTH_PRESETS.filter(p => p.category === category);
}

// Get presets by tags
export function getPresetsByTags(tags: string[]): SynthPreset[] {
  return SYNTH_PRESETS.filter(preset => 
    tags.some(tag => preset.tags.includes(tag))
  );
}

// Search presets by name or description
export function searchPresets(query: string): SynthPreset[] {
  const lowerQuery = query.toLowerCase();
  return SYNTH_PRESETS.filter(preset => 
    preset.name.toLowerCase().includes(lowerQuery) ||
    preset.description.toLowerCase().includes(lowerQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
