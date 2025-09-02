# Chord and Keys DAW

A comprehensive Digital Audio Workstation (DAW) built with TypeScript, featuring clip-based arrangement, pattern authoring, and professional-grade audio capabilities.

## Features

### 🎵 Core DAW Functionality
- **Pattern Mode**: Create and edit musical patterns with step sequencer and piano roll
- **Song Mode**: Arrange patterns into full songs using clip-based timeline
- **Transport Controls**: Play, pause, stop, record with pattern/song mode switching
- **Real-time Audio**: Powered by Tone.js with low-latency audio processing

### 🎛️ Pattern Authoring
- **Channel Rack**: Multi-channel step sequencer with velocity and length controls
- **Piano Roll**: Full-featured note editor with drag-and-drop, resizing, and quantization
- **Step Sequencer**: Classic 16-step grid with velocity and step length editing
- **Note Editing**: Create, move, resize, duplicate, and delete notes with keyboard shortcuts

### 📋 Arrangement & Playlist
- **Clip-based Arrangement**: Drag-and-drop pattern clips onto timeline tracks
- **Multi-track Timeline**: Unlimited tracks with independent clip placement
- **Clip Manipulation**: Move, resize, duplicate, and loop clips
- **Visual Grid**: Beat and bar grid with snap-to-grid functionality

### 🎚️ Mixer & Routing
- **Channel Strips**: Individual volume, pan, mute, and solo controls
- **Effects Sends**: Reverb and delay sends with level control
- **Master Bus**: Master volume and limiting
- **Channel Routing**: Flexible routing between channels and effects

### 💾 Project Management
- **Save/Load Projects**: Native .daw format with JSON export
- **Undo/Redo**: Full command history with undo/redo support
- **Project State**: Persistent state management with localStorage backup

## Architecture

### Core Modules

#### Audio Engine (`engine/audio-engine.ts`)
- Wraps Tone.js for clean audio interface
- Manages instrument loading and scheduling
- Handles channel routing and effects
- Provides clock and transport synchronization

#### Pattern Engine (`engine/pattern-compiler.ts`)
- Compiles pattern data into engine events
- Handles step sequencer and piano roll data
- Manages pattern loops and quantization
- Provides real-time pattern playback

#### Playback Service (`engine/playback-service.ts`)
- Manages transport modes (pattern/song)
- Handles scheduling and timing
- Coordinates between pattern and arrangement playback
- Provides position tracking and loop points

#### State Management (`store/index.ts`)
- Zustand-based state management
- Normalized data structure
- Command system for undo/redo
- Persistent storage with localStorage

### Data Model

```typescript
// Core types
type ID = string;
type Ticks = number; // PPQ ticks
type Seconds = number;

// Pattern structure
interface Pattern {
  id: ID;
  name: string;
  length: Ticks;
  resolution: number;
  channels: PatternChannel[];
}

// Arrangement structure
interface PatternClip {
  id: ID;
  type: 'pattern';
  trackId: ID;
  patternId: ID;
  start: Ticks;
  length: Ticks;
  transpose?: number;
  gainDb?: number;
}
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
cd web
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Usage

### Basic Workflow

1. **Create a Pattern**
   - Switch to Pattern mode
   - Use Channel Rack to create step sequences
   - Or use Piano Roll for detailed note editing

2. **Arrange in Song Mode**
   - Switch to Song mode
   - Drag patterns from browser to playlist tracks
   - Arrange clips to create your song structure

3. **Mix and Master**
   - Use the Mixer to adjust levels and panning
   - Add effects via sends
   - Use master controls for final output

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `Escape` | Stop |
| `Ctrl/Cmd + N` | New Pattern |
| `Ctrl/Cmd + S` | Save Project |
| `Ctrl/Cmd + O` | Load Project |
| `Delete` | Delete selected items |
| `Ctrl/Cmd + D` | Duplicate selected items |

### Mouse Controls

#### Piano Roll
- **Click + Drag**: Create new notes
- **Drag**: Move notes
- **Drag edge**: Resize notes
- **Double-click**: Create note at position

#### Playlist
- **Click + Drag**: Move clips
- **Drag edge**: Resize clips
- **Double-click**: Create clip at position
- **Right-click**: Context menu

#### Channel Rack
- **Click**: Toggle step
- **Drag**: Adjust velocity
- **Right-click**: Step options

## File Format

Projects are saved in a custom `.daw` format (JSON-based):

```json
{
  "id": "project-id",
  "name": "My Song",
  "version": 1,
  "bpm": 120,
  "timeSig": [4, 4],
  "ppq": 96,
  "patterns": { /* pattern data */ },
  "clips": { /* clip data */ },
  "playlistTracks": { /* track data */ },
  "order": ["track1", "track2"],
  "instruments": { /* instrument data */ },
  "mixer": { /* mixer data */ }
}
```

## Development

### Project Structure
```
web/
├── src/
│   ├── components/          # UI Components
│   │   ├── channel-rack.ts  # Step sequencer
│   │   ├── playlist.ts      # Timeline arrangement
│   │   ├── piano-roll.ts    # Note editor
│   │   ├── transport.ts     # Transport controls
│   │   └── mixer.ts         # Mixer interface
│   ├── engine/              # Audio & Logic
│   │   ├── audio-engine.ts  # Tone.js wrapper
│   │   ├── pattern-compiler.ts
│   │   ├── playback-service.ts
│   │   └── types.ts         # Type definitions
│   ├── store/               # State Management
│   │   └── index.ts         # Zustand store
│   └── main.ts              # Application entry
├── public/                  # Static assets
└── package.json
```

### Adding New Features

1. **New Audio Effects**
   - Add to `audio-engine.ts`
   - Update `types.ts` with new effect parameters
   - Add UI controls in `mixer.ts`

2. **New Pattern Types**
   - Extend `Pattern` interface in `types.ts`
   - Add compiler support in `pattern-compiler.ts`
   - Create UI component for editing

3. **New Transport Features**
   - Add to `playback-service.ts`
   - Update transport UI in `transport.ts`
   - Add keyboard shortcuts in `main.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Tone.js](https://tonejs.github.io/) for audio processing
- State management with [Zustand](https://github.com/pmndrs/zustand)
- UI styling with [Tailwind CSS](https://tailwindcss.com/)
- Build system with [Vite](https://vitejs.dev/)
