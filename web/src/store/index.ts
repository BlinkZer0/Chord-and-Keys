import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  RootState, 
  Project, 
  TransportState, 
  SelectionState, 
  Command,
  Pattern,
  PatternClip,
  PlaylistTrack,
  InstrumentDef,
  MixerChannel,
  ID,
  Ticks
} from '../engine/types';

// Utility functions
function generateId(): ID {
  return Math.random().toString(36).substr(2, 9);
}

function createEmptyProject(): Project {
  const masterId: ID = 'master';

  // Pre-create 125 insert channels + master
  const channels: Record<ID, MixerChannel> = {};
  for (let i = 1; i <= 125; i++) {
    const id = `ins-${i}` as ID;
    channels[id] = {
      id,
      name: `Insert ${i}`,
      color: undefined,
      inserts: [],
      sends: [],
      gainDb: 0,
      pan: 0,
      mute: false,
      solo: false,
      stereoSeparation: 0,
      phaseInvert: false,
      armed: false,
      busId: masterId
    };
  }
  channels[masterId] = {
    id: masterId,
    name: 'Master',
    color: '#94a3b8',
    inserts: [],
    sends: [],
    gainDb: 0,
    pan: 0,
    mute: false,
    solo: false,
    stereoSeparation: 0,
    phaseInvert: false,
    armed: false,
    busId: undefined
  };

  return {
    id: generateId(),
    name: 'Untitled Project',
    version: 1,
    bpm: 120,
    timeSig: [4, 4],
    ppq: 96,
    patterns: {},
    clips: {},
    playlistTracks: {},
    order: [],
    instruments: {},
    mixer: {
      channels,
      masterId
    },
    assets: {}
  };
}

// Command reducers
function reduce(state: RootState, command: Command): RootState {
  switch (command.type) {
    case 'CreatePattern': {
      const patternId = command.id || generateId();
      const pattern: Pattern = {
        id: patternId,
        name: command.name || `Pattern ${Object.keys(state.project.patterns).length + 1}`,
        length: command.length || state.project.ppq * 4, // 4 bars default
        resolution: command.resolution || 16, // 16th notes
        channels: [],
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      };
      
      return {
        ...state,
        project: {
          ...state.project,
          patterns: {
            ...state.project.patterns,
            [patternId]: pattern
          }
        }
      };
    }

    case 'AddChannelToPattern': {
      const pattern = state.project.patterns[command.patternId];
      if (!pattern) return state;

      const channelId = command.channelId || generateId();
      const channel = {
        id: channelId,
        instrumentId: command.instrumentId,
        mute: false,
        solo: false
      };

      return {
        ...state,
        project: {
          ...state.project,
          patterns: {
            ...state.project.patterns,
            [command.patternId]: {
              ...pattern,
              channels: [...pattern.channels, channel]
            }
          }
        }
      };
    }

    case 'UpdatePatternChannel': {
      const pattern = state.project.patterns[command.patternId];
      if (!pattern) return state;

      const updatedChannels = pattern.channels.map(c =>
        c.id === command.channelId ? { ...c, ...command.updates } : c
      );

      return {
        ...state,
        project: {
          ...state.project,
          patterns: {
            ...state.project.patterns,
            [command.patternId]: {
              ...pattern,
              channels: updatedChannels
            }
          }
        }
      };
    }

    case 'DeletePatternChannel': {
      const pattern = state.project.patterns[command.patternId];
      if (!pattern) return state;

      const updatedChannels = pattern.channels.filter(c => c.id !== command.channelId);

      return {
        ...state,
        project: {
          ...state.project,
          patterns: {
            ...state.project.patterns,
            [command.patternId]: {
              ...pattern,
              channels: updatedChannels
            }
          }
        }
      };
    }

    case 'InsertNotes': {
      const pattern = state.project.patterns[command.patternId];
      if (!pattern) return state;

      const channel = pattern.channels.find(c => c.id === command.channelId);
      if (!channel) return state;

      const updatedChannel = {
        ...channel,
        notes: [...(channel.notes || []), ...command.notes]
      };

      const updatedChannels = pattern.channels.map(c => 
        c.id === command.channelId ? updatedChannel : c
      );

      return {
        ...state,
        project: {
          ...state.project,
          patterns: {
            ...state.project.patterns,
            [command.patternId]: {
              ...pattern,
              channels: updatedChannels
            }
          }
        }
      };
    }

    case 'CreatePlaylistTrack': {
      const trackId = command.trackId || generateId();
      const track: PlaylistTrack = {
        id: trackId,
        name: command.name || `Track ${state.project.order.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        muted: false,
        locked: false
      };

      return {
        ...state,
        project: {
          ...state.project,
          playlistTracks: {
            ...state.project.playlistTracks,
            [trackId]: track
          },
          order: [...state.project.order, trackId]
        }
      };
    }

    case 'CreatePatternClip': {
      const clipId = command.clipId || generateId();
      const clip: PatternClip = {
        id: clipId,
        type: 'pattern',
        trackId: command.trackId,
        patternId: command.patternId,
        start: command.start,
        length: command.length || state.project.ppq * 4,
        loop: false,
        color: state.project.patterns[command.patternId]?.color,
        name: state.project.patterns[command.patternId]?.name
      };

      return {
        ...state,
        project: {
          ...state.project,
          clips: {
            ...state.project.clips,
            [clipId]: clip
          }
        }
      };
    }

    case 'MoveClip': {
      const clip = state.project.clips[command.clipId];
      if (!clip) return state;

      return {
        ...state,
        project: {
          ...state.project,
          clips: {
            ...state.project.clips,
            [command.clipId]: {
              ...clip,
              start: Math.max(0, clip.start + command.delta)
            }
          }
        }
      };
    }

    case 'ResizeClip': {
      const clip = state.project.clips[command.clipId];
      if (!clip) return state;

      return {
        ...state,
        project: {
          ...state.project,
          clips: {
            ...state.project.clips,
            [command.clipId]: {
              ...clip,
              length: Math.max(state.project.ppq / 4, command.newLength) // minimum 16th note
            }
          }
        }
      };
    }

    case 'SplitClipAt': {
      const clip = state.project.clips[command.clipId];
      if (!clip || clip.start >= command.at || clip.start + clip.length <= command.at) return state;

      const newClipId = generateId();
      const newClip: PatternClip = {
        ...clip,
        id: newClipId,
        start: command.at,
        length: clip.start + clip.length - command.at
      };

      const updatedClip = {
        ...clip,
        length: command.at - clip.start
      };

      return {
        ...state,
        project: {
          ...state.project,
          clips: {
            ...state.project.clips,
            [command.clipId]: updatedClip,
            [newClipId]: newClip
          }
        }
      };
    }

    case 'SetTransportMode': {
      return {
        ...state,
        transport: {
          ...state.transport,
          mode: command.mode
        }
      };
    }

    case 'SetTransportPlaying': {
      return {
        ...state,
        transport: {
          ...state.transport,
          playing: command.playing
        }
      };
    }

    case 'SetTransportPosition': {
      return {
        ...state,
        transport: {
          ...state.transport,
          position: command.position
        }
      };
    }

    case 'SetBpm': {
      return {
        ...state,
        transport: {
          ...state.transport,
          bpm: command.bpm
        },
        project: {
          ...state.project,
          bpm: command.bpm
        }
      };
    }

    case 'SetSelectedPattern': {
      return {
        ...state,
        transport: {
          ...state.transport,
          selectedPatternId: command.patternId
        }
      };
    }

    case 'CreateInstrument': {
      const instrumentId = command.id || generateId();
      const instrument: InstrumentDef = {
        id: instrumentId,
        name: command.name,
        type: command.instType,
        params: command.params || {},
        defaultMixerChannelId: command.mixerChannelId
      };

      return {
        ...state,
        project: {
          ...state.project,
          instruments: {
            ...state.project.instruments,
            [instrumentId]: instrument
          }
        }
      };
    }

    case 'SetMixerChannel': {
      const channel = state.project.mixer.channels[command.channelId];
      if (!channel) return state;

      const updated: MixerChannel = { ...channel, ...command.updates } as MixerChannel;
      return {
        ...state,
        project: {
          ...state.project,
          mixer: {
            ...state.project.mixer,
            channels: {
              ...state.project.mixer.channels,
              [command.channelId]: updated
            }
          }
        }
      };
    }

    case 'CreateMixerChannel': {
      const id = command.id || generateId();
      const channel: MixerChannel = {
        id,
        name: command.name || 'Channel',
        color: command.color,
        inserts: [],
        sends: [],
        gainDb: 0,
        pan: 0,
        busId: state.project.mixer.masterId
      };
      return {
        ...state,
        project: {
          ...state.project,
          mixer: {
            ...state.project.mixer,
            channels: {
              ...state.project.mixer.channels,
              [id]: channel
            }
          }
        }
      };
    }

    case 'DeleteClip': {
      const { [command.clipId]: deleted, ...remainingClips } = state.project.clips;
      return {
        ...state,
        project: {
          ...state.project,
          clips: remainingClips
        },
        selection: {
          ...state.selection,
          clipIds: state.selection.clipIds.filter(id => id !== command.clipId)
        }
      };
    }

    case 'DuplicateClip': {
      const clip = state.project.clips[command.clipId];
      if (!clip) return state;

      const newClipId = generateId();
      const newClip = {
        ...clip,
        id: newClipId,
        start: clip.start + clip.length + state.project.ppq // place after original
      };

      return {
        ...state,
        project: {
          ...state.project,
          clips: {
            ...state.project.clips,
            [newClipId]: newClip
          }
        },
        selection: {
          ...state.selection,
          clipIds: [newClipId]
        }
      };
    }

    case 'SetSelection': {
      return {
        ...state,
        selection: {
          ...state.selection,
          ...command.selection
        }
      };
    }

    default:
      return state;
  }
}

// Store creation
export const useStore = create<RootState & {
  dispatchCommand: (cmd: Command) => void;
  undo: () => void;
  redo: () => void;
  saveState: (description: string) => void;
}>()(
  subscribeWithSelector((set, get) => ({
    project: createEmptyProject(),
    transport: { 
      mode: 'pattern', 
      playing: false, 
      position: 0, 
      bpm: 120 
    },
    selection: { 
      clipIds: [], 
      patternId: undefined, 
      channelId: undefined, 
      noteIds: [] 
    },
    ui: {
      zoomX: 1,
      zoomY: 1,
      scrollX: 0,
      scrollY: 0,
      scheme: 'Classic'
    },

    // Command system
    dispatchCommand: (cmd: Command) => {
      const state = get();
      const newState = reduce(state, cmd);
      set(newState);
      
      // Save to undo stack
      get().saveState(cmd.type);
    },

    // Undo/Redo system
    undo: () => {
      // Implementation will be added with undo stack
      console.log('Undo not implemented yet');
    },

    redo: () => {
      // Implementation will be added with redo stack
      console.log('Redo not implemented yet');
    },

    saveState: (description: string) => {
      // Implementation will be added with undo stack
      console.log('Save state:', description);
    }
  }))
);

// Selectors for common state access
export const useProject = () => useStore(state => state.project);
export const useTransport = () => useStore(state => state.transport);
export const useSelection = () => useStore(state => state.selection);
export const useUI = () => useStore(state => state.ui);
export const useMixer = () => useStore(state => state.project.mixer);

// Pattern selectors
export const usePatterns = () => useStore(state => state.project.patterns);
export const usePattern = (id: ID) => useStore(state => state.project.patterns[id]);

// Playlist selectors
export const usePlaylistTracks = () => useStore(state => state.project.playlistTracks);
export const usePlaylistOrder = () => useStore(state => state.project.order);
export const useClips = () => useStore(state => state.project.clips);

// Transport selectors
export const useTransportMode = () => useStore(state => state.transport.mode);
export const useIsPlaying = () => useStore(state => state.transport.playing);
export const useBpm = () => useStore(state => state.transport.bpm);
export const usePosition = () => useStore(state => state.transport.position);

// Selection selectors
export const useSelectedClips = () => useStore(state => state.selection.clipIds);
export const useSelectedPattern = () => useStore(state => state.selection.patternId);
export const useSelectedChannel = () => useStore(state => state.selection.channelId);

// Actions
export const useActions = () => {
  const dispatch = useStore(state => state.dispatchCommand);
  
  return {
    createPattern: (name?: string, length?: Ticks, resolution?: number) => {
      const id = generateId();
      dispatch({ type: 'CreatePattern', id, name, length, resolution });
      return id as ID;
    },
    
    addChannelToPattern: (patternId: ID, instrumentId: ID) => {
      const channelId = generateId();
      dispatch({ type: 'AddChannelToPattern', patternId, instrumentId, channelId });
      return channelId as ID;
    },

    updatePatternChannel: (patternId: ID, channelId: ID, updates: Partial<any>) =>
      dispatch({ type: 'UpdatePatternChannel', patternId, channelId, updates }),

    deletePatternChannel: (patternId: ID, channelId: ID) =>
      dispatch({ type: 'DeletePatternChannel', patternId, channelId }),
    
    insertNotes: (patternId: ID, channelId: ID, notes: any[]) =>
      dispatch({ type: 'InsertNotes', patternId, channelId, notes }),
    
    createPlaylistTrack: (name?: string) => {
      const trackId = generateId();
      dispatch({ type: 'CreatePlaylistTrack', trackId, name });
      return trackId as ID;
    },
    
    createPatternClip: (trackId: ID, patternId: ID, start: Ticks, length?: Ticks) => {
      const clipId = generateId();
      dispatch({ type: 'CreatePatternClip', clipId, trackId, patternId, start, length });
      return clipId as ID;
    },
    
    moveClip: (clipId: ID, delta: Ticks) =>
      dispatch({ type: 'MoveClip', clipId, delta }),
    
    resizeClip: (clipId: ID, newLength: Ticks) =>
      dispatch({ type: 'ResizeClip', clipId, newLength }),
    
    splitClipAt: (clipId: ID, at: Ticks) =>
      dispatch({ type: 'SplitClipAt', clipId, at }),
    
    setTransportMode: (mode: 'pattern' | 'song') =>
      dispatch({ type: 'SetTransportMode', mode }),

    setTransportPlaying: (playing: boolean) =>
      dispatch({ type: 'SetTransportPlaying', playing }),

    setTransportPosition: (position: Ticks) =>
      dispatch({ type: 'SetTransportPosition', position }),
    
    setBpm: (bpm: number) =>
      dispatch({ type: 'SetBpm', bpm }),
    
    setSelectedPattern: (patternId: ID) =>
      dispatch({ type: 'SetSelectedPattern', patternId }),
    
    deleteClip: (clipId: ID) =>
      dispatch({ type: 'DeleteClip', clipId }),
    
    duplicateClip: (clipId: ID) =>
      dispatch({ type: 'DuplicateClip', clipId }),
    
    setSelection: (selection: Partial<SelectionState>) =>
      dispatch({ type: 'SetSelection', selection }),

    createInstrument: (name: string, instType: InstrumentDef['type'], params?: Record<string, any>, mixerChannelId?: ID, id?: ID) => {
      const _id = id || generateId();
      dispatch({ type: 'CreateInstrument', id: _id, name, instType, params, mixerChannelId });
      return _id as ID;
    },

    createMixerChannel: (name?: string, color?: string, id?: ID) => {
      const _id = id || generateId();
      dispatch({ type: 'CreateMixerChannel', id: _id, name, color });
      return _id as ID;
    },

    setMixerChannel: (channelId: ID, updates: Partial<MixerChannel>) =>
      dispatch({ type: 'SetMixerChannel', channelId, updates })
  };
};
