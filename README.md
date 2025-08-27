# Chord & Scale Library

An interactive web application for exploring chords, scales, and music theory with visual instrument representations.

## Features

### Core Functionality
- **Chord & Scale Explorer**: Visualize chords and scales on various instruments
- **Multiple Instruments**: Piano, Guitar, Bass, Violin, Flute, Recorder, Trumpet, Saxophone, Koto, Ney
- **Audio Playback**: Play chords and scales using Tone.js
- **Sequencer**: Advanced MIDI sequencer with pattern library
- **Export Options**: MIDI, CSV, and FL Studio integration

### New 3D Instrument Models
- **3D Visualizations**: Realistic 3D models for Flute, Recorder, Trumpet, Saxophone, and Ney
- **Musically Accurate Fingering**: Proper finger positions displayed on 3D models
- **Interactive Toggle**: Switch between humorous SVG models and realistic 3D models
- **Enhanced Lighting**: Professional 3D lighting and materials

### Instrument Support
- **Piano**: Full 88-key visualization with note highlighting
- **Guitar/Bass**: Fretboard diagrams with playable note positions
- **Violin**: 4-string fingerboard visualization
- **Wind Instruments**: 
  - **SVG Mode**: Humorous, stylized representations
  - **3D Mode**: Realistic 3D models with accurate fingering positions
- **Koto**: Traditional Japanese string instrument layout
- **Ney**: Middle Eastern flute with authentic fingering

## Usage

### Basic Navigation
1. **Choose Mode**: Select Chord, Scale/Mode, or Sequencer
2. **Select Parameters**: Choose key, quality/mode, and instrument
3. **Visualize**: See the selected notes highlighted on your chosen instrument
4. **Listen**: Play the chord or scale with audio

### 3D Models
- **Toggle Mode**: Use the "Use SVG models (humorous)" checkbox in Settings
- **Default**: 3D models are enabled by default
- **Fingering Display**: Red indicators show root notes, green show other scale/chord notes
- **Interactive**: 3D models rotate slowly to show all angles

### Settings
- **Audio Quality**: Adjust sample quality and reverb
- **Interface**: Customize piano key size and animations
- **Model Type**: Toggle between SVG and 3D instrument models
- **Session Management**: Auto-save and restore functionality

## Technical Details

### 3D Implementation
- **Three.js**: WebGL-based 3D rendering
- **Instrument-Specific Geometry**: Each instrument has optimized 3D representation
- **Fingering Positions**: Musically accurate finger placement coordinates
- **Performance Optimized**: Efficient rendering with proper cleanup

### Audio Engine
- **Tone.js**: Professional audio synthesis
- **Sample Library**: High-quality instrument samples
- **Real-time Processing**: Low-latency audio playback

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebGL Support**: Required for 3D models
- **Audio Context**: Required for sound playback

## Development

### File Structure
```
├── chord_scale_library_html_tailwind_tone.html  # Main application
├── src/
│   ├── theory/                                  # Music theory modules
│   │   ├── chords.js
│   │   ├── notes.js
│   │   └── scales.js
│   └── sequencer.js                             # Sequencer functionality
├── tests/                                       # Test files
└── README.md
```

### Key Components
- **Music Theory Engine**: Quarter-tone support, maqam scales
- **3D Scene Management**: Instrument-specific 3D scenes
- **Audio Synthesis**: Multi-instrument audio engine
- **UI Framework**: Tailwind CSS with custom themes

## Credits

- **3D Models**: Sketchfab community models
- **Audio Samples**: Tonejs-instruments library
- **Music Theory**: MaqamWorld and traditional theory sources
- **UI Framework**: Tailwind CSS
- **3D Engine**: Three.js
- **Audio Engine**: Tone.js

## License

This project is open source and available under the MIT License.
