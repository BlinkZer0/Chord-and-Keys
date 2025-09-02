import { useStore, useActions, usePattern, useSelectedPattern } from '../store';
import type { PatternChannel, Step, Note, ID } from '../engine/types';

export class ChannelRack {
  private container: HTMLElement;
  private patternId: ID | null = null;
  private channels: Map<ID, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private renderMixerRouteOptions(selected?: ID): string {
    const mixer = useStore.getState().project.mixer;
    const ids = Object.keys(mixer.channels)
      .filter(id => id !== mixer.masterId)
      .sort((a, b) => {
        const na = parseInt((a.split('-')[1] || '0'), 10);
        const nb = parseInt((b.split('-')[1] || '0'), 10);
        return na - nb;
      });
    return ids.map(id => `<option value="${id}" ${selected === id ? 'selected' : ''}>${mixer.channels[id].name}</option>`).join('');
  }

  setPattern(patternId: ID | null): void {
    this.patternId = patternId;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    
    if (!this.patternId) {
      this.showEmptyState();
      return;
    }

    const pattern = useStore.getState().project.patterns[this.patternId];
    if (!pattern) {
      this.showEmptyState();
      return;
    }

    this.renderPattern(pattern);
  }

  private showEmptyState(): void {
    this.container.innerHTML = `
      <div class="p-4 text-center text-slate-400">
        <p class="text-sm">No pattern selected</p>
        <p class="text-xs mt-1">Create a pattern to start editing</p>
      </div>
    `;
  }

  private renderPattern(pattern: any): void {
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between p-3 border-b border-slate-700';
    
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium text-slate-200">${pattern.name}</h3>
        <span class="text-xs text-slate-400">${pattern.channels.length} channels</span>
      </div>
      <button id="add-channel" class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded">
        Add Channel
      </button>
    `;

    this.container.appendChild(header);

    // Add channel button
    header.querySelector('#add-channel')?.addEventListener('click', () => {
      this.addChannel();
    });

    // Render channels
    const channelsContainer = document.createElement('div');
    channelsContainer.className = 'space-y-2 p-3';
    
    pattern.channels.forEach((channel: PatternChannel) => {
      const channelElement = this.renderChannel(channel, pattern);
      channelsContainer.appendChild(channelElement);
      this.channels.set(channel.id, channelElement);
    });

    this.container.appendChild(channelsContainer);
  }

  private renderChannel(channel: PatternChannel, pattern: any): HTMLElement {
    const channelElement = document.createElement('div');
    channelElement.className = 'bg-slate-800 rounded-lg p-3 border border-slate-700';
    
    const instrument = useStore.getState().project.instruments[channel.instrumentId];
    const instrumentName = instrument?.name || 'Unknown Instrument';

    channelElement.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <input type="checkbox" id="mute-${channel.id}" ${channel.mute ? 'checked' : ''} class="rounded">
          <label for="mute-${channel.id}" class="text-xs text-slate-300">Mute</label>
          <input type="checkbox" id="solo-${channel.id}" ${channel.solo ? 'checked' : ''} class="rounded">
          <label for="solo-${channel.id}" class="text-xs text-slate-300">Solo</label>
        </div>
        <button class="text-xs text-red-400 hover:text-red-300" data-action="delete-channel" data-channel-id="${channel.id}">
          Delete
        </button>
      </div>
      
      <div class="mb-3">
        <label class="block text-xs text-slate-400 mb-1">Instrument</label>
        <select class="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" data-channel-id="${channel.id}">
          <option value="${channel.instrumentId}" selected>${instrumentName}</option>
          <option value="piano">Piano</option>
          <option value="bass">Bass</option>
          <option value="drums">Drums</option>
          <option value="synth">Synth</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="block text-xs text-slate-400 mb-1">Mixer Track</label>
        <select class="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" data-action="route" data-channel-id="${channel.id}">
          ${this.renderMixerRouteOptions(channel.mixerChannelId)}
        </select>
      </div>
      
      <div class="mb-3">
        <label class="block text-xs text-slate-400 mb-1">Volume</label>
        <input type="range" min="0" max="1" step="0.01" value="0.8" class="w-full" data-channel-id="${channel.id}">
      </div>
      
      <div class="mb-3">
        <label class="block text-xs text-slate-400 mb-1">Pan</label>
        <input type="range" min="-1" max="1" step="0.01" value="0" class="w-full" data-channel-id="${channel.id}">
      </div>
      
      <div class="flex gap-2 mb-3">
        <button class="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded" data-action="piano-roll" data-channel-id="${channel.id}">
          Piano Roll
        </button>
        <button class="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded" data-action="step-sequencer" data-channel-id="${channel.id}">
          Step Seq
        </button>
      </div>
      
      <div class="step-sequencer" data-channel-id="${channel.id}" style="display: none;">
        <div class="grid grid-cols-16 gap-1 mb-2">
          ${this.renderStepGrid(channel, pattern)}
        </div>
        <div class="flex gap-2">
          <input type="range" min="0" max="1" step="0.01" value="0.8" class="flex-1" data-action="velocity" data-channel-id="${channel.id}">
          <span class="text-xs text-slate-400">Velocity</span>
        </div>
      </div>
    `;

    // Add event listeners
    this.addChannelEventListeners(channelElement, channel, pattern);

    return channelElement;
  }

  private renderStepGrid(channel: PatternChannel, pattern: any): string {
    const steps = channel.steps || [];
    const resolution = pattern.resolution;
    
    let html = '';
    for (let i = 0; i < resolution; i++) {
      const step = steps.find(s => s.stepIndex === i);
      const isActive = step && step.velocity > 0;
      
      html += `
        <button class="w-6 h-6 rounded text-xs ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}" 
                data-step="${i}" data-channel-id="${channel.id}">
          ${i + 1}
        </button>
      `;
    }
    
    return html;
  }

  private addChannelEventListeners(element: HTMLElement, channel: PatternChannel, pattern: any): void {
    const actions = useActions();

    // Mute/Solo toggles
    element.querySelector(`#mute-${channel.id}`)?.addEventListener('change', (e) => {
      const muted = (e.target as HTMLInputElement).checked;
      // Update channel mute state
      this.updateChannel(channel.id, { mute: muted });
    });

    element.querySelector(`#solo-${channel.id}`)?.addEventListener('change', (e) => {
      const solo = (e.target as HTMLInputElement).checked;
      // Update channel solo state
      this.updateChannel(channel.id, { solo });
    });

    // Delete channel
    element.querySelector('[data-action="delete-channel"]')?.addEventListener('click', () => {
      if (confirm('Delete this channel?')) {
        this.deleteChannel(channel.id);
      }
    });

    // Instrument selection
    element.querySelector('select:not([data-action="route"])')?.addEventListener('change', (e) => {
      const instrumentId = (e.target as HTMLSelectElement).value;
      this.updateChannel(channel.id, { instrumentId });
    });

    // Routing selection
    element.querySelector('[data-action="route"]')?.addEventListener('change', (e) => {
      const insertId = (e.target as HTMLSelectElement).value as ID;
      this.updateChannel(channel.id, { mixerChannelId: insertId });
      // Route instrument output in engine
      const ch = useStore.getState().project.patterns[this.patternId!].channels.find(c => c.id === channel.id);
      if (ch) {
        const instId = ch.instrumentId;
        import('../engine/audio-engine').then(({ audioEngine }) => {
          audioEngine.setInstrumentInsert(instId as ID, insertId);
        });
      }
    });

    // Piano Roll button
    element.querySelector('[data-action="piano-roll"]')?.addEventListener('click', () => {
      this.openPianoRoll(channel.id);
    });

    // Step Sequencer button
    element.querySelector('[data-action="step-sequencer"]')?.addEventListener('click', () => {
      this.toggleStepSequencer(channel.id);
    });

    // Step grid buttons
    element.querySelectorAll('[data-step]').forEach(button => {
      button.addEventListener('click', (e) => {
        const stepIndex = parseInt((e.target as HTMLElement).dataset.step || '0');
        this.toggleStep(channel.id, stepIndex);
      });
    });

    // Velocity slider
    element.querySelector('[data-action="velocity"]')?.addEventListener('input', (e) => {
      const velocity = parseFloat((e.target as HTMLInputElement).value);
      this.setStepVelocity(channel.id, velocity);
    });
  }

  private addChannel(): void {
    if (!this.patternId) return;

    const actions = useActions();
    let instrumentId: ID | undefined = Object.keys(useStore.getState().project.instruments)[0] as ID | undefined;
    if (!instrumentId) {
      instrumentId = actions.createInstrument('Default Synth', 'synth', {});
      // Also create a mixer channel for it (optional UI sync)
      // Route to Insert 1 by default
    }
    const channelId = actions.addChannelToPattern(this.patternId, instrumentId);
    // Default route to Insert 1
    const defaultInsert = 'ins-1' as ID;
    actions.updatePatternChannel(this.patternId, channelId, { mixerChannelId: defaultInsert } as any);
    import('../engine/audio-engine').then(({ audioEngine }) => {
      audioEngine.setInstrumentInsert(instrumentId as ID, defaultInsert);
    });
    this.render(); // Re-render to show new channel
  }

  private deleteChannel(channelId: ID): void {
    if (!this.patternId) return;

    const actions = useActions();
    actions.deletePatternChannel(this.patternId, channelId);
    this.render();
  }

  private updateChannel(channelId: ID, updates: Partial<PatternChannel>): void {
    if (!this.patternId) return;

    const actions = useActions();
    actions.updatePatternChannel(this.patternId, channelId, updates);
  }

  private openPianoRoll(channelId: ID): void {
    // Set selection to this channel
    useStore.getState().dispatchCommand({
      type: 'SetSelection',
      selection: { 
        patternId: this.patternId!,
        channelId 
      }
    });

    // In a real implementation, you'd open the piano roll view
    console.log('Open piano roll for channel:', channelId);
  }

  private toggleStepSequencer(channelId: ID): void {
    const stepSequencer = this.container.querySelector(`[data-channel-id="${channelId}"].step-sequencer`);
    if (stepSequencer) {
      const isVisible = stepSequencer.style.display !== 'none';
      stepSequencer.style.display = isVisible ? 'none' : 'block';
    }
  }

  private toggleStep(channelId: ID, stepIndex: number): void {
    if (!this.patternId) return;

    const pattern = useStore.getState().project.patterns[this.patternId];
    if (!pattern) return;

    const channel = pattern.channels.find(c => c.id === channelId);
    if (!channel) return;

    const steps = channel.steps || [];
    const existingStep = steps.find(s => s.stepIndex === stepIndex);

    let updatedSteps: Step[];
    if (existingStep) {
      // Toggle step off
      updatedSteps = steps.filter(s => s.stepIndex !== stepIndex);
    } else {
      // Add step
      updatedSteps = [...steps, { stepIndex, velocity: 0.8, lengthSteps: 1 }];
    }

    this.updateChannel(channelId, { steps: updatedSteps });
    this.render(); // Re-render to update step grid
  }

  private setStepVelocity(channelId: ID, velocity: number): void {
    // In a real implementation, you'd update the velocity for the currently selected step
    console.log('Set step velocity:', channelId, velocity);
  }
}

// Legacy compatibility
export function mountChannelRack(container: HTMLElement, options?: any): ChannelRack {
  return new ChannelRack(container);
}
