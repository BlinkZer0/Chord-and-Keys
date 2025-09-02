import './styles.css';
import { ChannelRack } from './components/channel-rack';
import { Playlist } from './components/playlist';
import { PianoRoll } from './components/piano-roll';
import { Transport } from './components/transport';
import { Mixer } from './components/mixer';
import { useStore, useActions } from './store';
import { playbackService } from './engine/playback-service';
import { audioEngine } from './engine/audio-engine';
import type { ID } from './engine/types';

// Playback service singleton is imported

// Main DAW application class
class DAW {
  private container: HTMLElement;
  private transport: Transport;
  private channelRack: ChannelRack;
  private playlist: Playlist;
  private pianoRoll: PianoRoll;
  private mixer: Mixer;

  constructor() {
    this.container = document.getElementById('app')!;
    this.setupLayout();
    this.initializeComponents();
    this.setupStoreSubscriptions();
    this.setupKeyboardShortcuts();
  }

  private setupLayout(): void {
    this.container.innerHTML = `
      <div class="h-screen bg-slate-900 text-white flex flex-col">
        <!-- Transport Bar -->
        <div id="transport" class="flex-shrink-0"></div>
        
        <!-- Main Content Area -->
        <div class="flex-1 flex">
          <!-- Left Panel: Channel Rack -->
          <div id="channel-rack" class="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0"></div>
          
          <!-- Center Panel: Playlist and Piano Roll -->
          <div class="flex-1 flex flex-col">
            <!-- Playlist -->
            <div id="playlist" class="flex-1 bg-slate-900 border-b border-slate-700"></div>
            
            <!-- Piano Roll -->
            <div id="piano-roll" class="h-64 bg-slate-900"></div>
          </div>
          
          <!-- Right Panel: Mixer -->
          <div id="mixer" class="w-80 bg-slate-800 border-l border-slate-700 flex-shrink-0"></div>
        </div>
      </div>
    `;
  }

  private initializeComponents(): void {
    // Initialize transport
    const transportContainer = document.getElementById('transport')!;
    this.transport = new Transport(transportContainer);

    // Initialize channel rack
    const channelRackContainer = document.getElementById('channel-rack')!;
    this.channelRack = new ChannelRack(channelRackContainer);

    // Initialize playlist
    const playlistContainer = document.getElementById('playlist')!;
    this.playlist = new Playlist(playlistContainer);

    // Initialize piano roll
    const pianoRollContainer = document.getElementById('piano-roll')!;
    this.pianoRoll = new PianoRoll(pianoRollContainer);

    // Initialize mixer
    const mixerContainer = document.getElementById('mixer')!;
    this.mixer = new Mixer(mixerContainer);
  }

  private setupStoreSubscriptions(): void {
    // Subscribe to store changes and update components
    useStore.subscribe((state) => {
      // Update transport display
      this.transport.updateDisplay();
      
      // Update playlist when clips change
      this.playlist.render();
      
      // Update piano roll when notes change
      this.pianoRoll.render();
      
      // Update mixer when channels change
      this.mixer.updateDisplay();
      // Keep audio engine mixer graph in sync
      audioEngine.updateMixer(state.project.mixer);
      
      // Update channel rack when pattern changes
      const selectedPattern = state.selection.patternId;
      this.channelRack.setPattern(selectedPattern);
    });
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Global keyboard shortcuts
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          const actions = useActions();
          const transport = useStore.getState().transport;
          if (transport.playing) {
            actions.pauseTransport();
          } else {
            actions.playTransport();
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          useActions().stopTransport();
          break;
          
        case 'KeyN':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            useActions().createPattern('New Pattern');
          }
          break;
          
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.saveProject();
          }
          break;
          
        case 'KeyO':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.loadProject();
          }
          break;
      }
    });
  }

  private saveProject(): void {
    const project = useStore.getState().project;
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${project.name || 'untitled'}.daw`;
    link.click();
  }

  private loadProject(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.daw,.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target?.result as string);
          useActions().loadProject(project);
        } catch (error) {
          console.error('Failed to load project:', error);
          alert('Failed to load project file');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  // Public method to start the DAW
  start(): void {
    console.log('DAW started');
    
    // Create initial project structure if none exists
    const state = useStore.getState();
    if (Object.keys(state.project.patterns).length === 0) {
      const actions = useActions();
      // Create a default instrument
      const instId = actions.createInstrument('Default Synth', 'synth', {});

      // Create a default pattern
      const patternId = actions.createPattern('Pattern 1');

      // Create a default channel in the pattern
      const channelId = actions.addChannelToPattern(patternId, instId);
      // Route to Insert 1 by default
      const defaultInsert = 'ins-1' as ID;
      actions.updatePatternChannel(patternId, channelId, { mixerChannelId: defaultInsert } as any);
      audioEngine.setInstrumentInsert(instId as any, defaultInsert);

      // Create a default playlist track and clip
      const trackId = actions.createPlaylistTrack('Track 1');
      actions.createPatternClip(trackId, patternId, 0);

      // Select the pattern and channel
      actions.setSelection({ patternId, channelId, clipIds: [], noteIds: [] });
    }
  }
}

// Initialize the DAW when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const daw = new DAW();
  daw.start();
});

// Export for potential external use
export { DAW };
