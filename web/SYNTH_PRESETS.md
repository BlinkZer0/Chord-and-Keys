# Synth Preset System

The sequencer now includes a comprehensive synth preset system with over 50 carefully crafted presets organized in a tree structure for easy navigation.

## Features

### Channel Rack
- **Tree Organization**: Presets are organized by category and subcategory
- **Search Functionality**: Quick search through all presets by name, description, or tags
- **Preset Preview**: Click the 🔊 button to preview any preset
- **Visual Indicators**: Color-coded type indicators (synth, drum, sampler)
- **Collapsible Interface**: Expand/collapse categories to manage screen space

### Preset Categories

#### Analog Synths
- **Pads**: Warm analog pads with slow attack and rich harmonics
- **Bass**: Fat analog bass with punchy envelope
- **Leads**: Bright analog leads with quick attack

#### Digital Synths
- **Bells**: Bright digital bells with long decay
- **Plucks**: Sharp digital plucks with quick decay
- **Arpeggios**: Bright arpeggio sounds with quick envelope

#### FM Synths
- **Bells**: Complex FM bells with rich harmonics
- **Bass**: Deep FM bass with modulation
- **Leads**: Bright FM leads with complex timbre

#### AM Synths
- **Brass**: Warm AM brass with ring modulation
- **Strings**: Rich AM strings with modulation

#### Drums
- **Kicks**: Classic 808, punchy kicks
- **Snares**: Tight, crackling snares
- **Hi-Hats**: Closed and open hi-hats
- **Cymbals**: Ride cymbals with long decay
- **Claps**: Short and wide claps

#### World Percussion
- **Congas**: Hand-played conga drums
- **Bongos**: Hand-played bongo drums
- **Tablas**: Hand-played tabla drums

#### Pads
- **Ambient**: Ethereal ambient pads with long release
- **Choir**: Choir-like pads with multiple oscillators
- **Strings**: Rich string pads with vibrato

#### Leads
- **Saw**: Bright sawtooth leads with filter
- **Square**: Hollow square wave leads
- **Sine**: Pure sine wave leads

#### Bass
- **Sub**: Deep sub bass with long decay
- **Acid**: Acid-style bass with resonance
- **Wobble**: Wobble bass with LFO modulation

#### Plucks
- **Kalimba**: Kalimba-like plucks with metallic tone
- **Guitar**: Guitar-like plucks with string resonance
- **Harp**: Harp-like plucks with long resonance

## Usage

### Selecting Presets
1. Navigate to the **Sequencer** panel
2. Use the **Channel Rack** on the left side
3. Browse categories or use the search bar
4. Click on a preset to apply it to the selected track
5. Use the 🔊 button to preview before applying

### Track Management
- Each track can have its own preset
- Presets are applied in real-time
- Multiple tracks can use different presets simultaneously

### Search Tips
- Search by preset name: "warm", "bright", "punchy"
- Search by instrument type: "bass", "lead", "pad"
- Search by characteristics: "analog", "digital", "fm"
- Use tags: "ambient", "electronic", "world"

## Technical Details

### Preset Structure
Each preset includes:
- **ID**: Unique identifier
- **Name**: Human-readable name
- **Category**: Main category (Analog, Digital, FM, etc.)
- **Subcategory**: Specific type (Pads, Bass, Leads, etc.)
- **Description**: Detailed description of the sound
- **Type**: Instrument type (synth, drum, sampler)
- **Factory**: Function that creates the Tone.js instrument
- **Tags**: Searchable keywords

### Tone.js Integration
- All presets use Tone.js synthesis
- Supports PolySynth, MonoSynth, AMSynth, FMSynth, PluckSynth
- Includes drum machines (MembraneSynth, MetalSynth, NoiseSynth)
- Real-time parameter control
- Automatic cleanup and memory management

### Performance
- Lazy loading of instruments
- Efficient preset switching
- Memory-conscious design
- Optimized for real-time performance

## Customization

### Adding New Presets
To add new presets, edit `src/engine/synth-presets.ts`:

```typescript
{
  id: 'my-custom-preset',
  name: 'My Custom Preset',
  category: 'Custom',
  subcategory: 'Experimental',
  description: 'A custom experimental sound',
  type: 'synth',
  factory: () => createPolySynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.0 },
    filter: { frequency: 2000, Q: 1, type: 'lowpass' }
  }),
  tags: ['custom', 'experimental', 'sawtooth']
}
```

### Modifying Existing Presets
Edit the factory functions in the preset definitions to customize the sound parameters.

## Browser Compatibility
- Modern browsers with Web Audio API support
- Tone.js compatibility
- Responsive design for different screen sizes
