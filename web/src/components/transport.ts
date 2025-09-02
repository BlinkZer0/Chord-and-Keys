import { useStore, useActions } from '../store';
import type { Project } from '../engine/types';
import { playbackService } from '../engine/playback-service';

export class Transport {
  private container: HTMLElement;
  private playButton: HTMLButtonElement;
  private stopButton: HTMLButtonElement;
  private recordButton: HTMLButtonElement;
  private patternModeButton: HTMLButtonElement;
  private songModeButton: HTMLButtonElement;
  private tempoInput: HTMLInputElement;
  private timeSigInput: HTMLInputElement;
  private positionDisplay: HTMLDivElement;
  private bpmDisplay: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupLayout();
    this.setupEventListeners();
    this.render();
  }

  private setupLayout(): void {
    this.container.className = 'flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700';
    
    // Transport controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flex items-center space-x-2';
    
    // Play/Stop buttons
    this.playButton = document.createElement('button');
    this.playButton.className = 'w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center';
    this.playButton.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5v10l8-5-8-5z"/></svg>';
    
    this.stopButton = document.createElement('button');
    this.stopButton.className = 'w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center';
    this.stopButton.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 6h8v8H6V6z"/></svg>';
    
    this.recordButton = document.createElement('button');
    this.recordButton.className = 'w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center';
    this.recordButton.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="6"/></svg>';
    
    controlsDiv.appendChild(this.playButton);
    controlsDiv.appendChild(this.stopButton);
    controlsDiv.appendChild(this.recordButton);
    
    // Mode switching
    const modeDiv = document.createElement('div');
    modeDiv.className = 'flex items-center space-x-1 bg-slate-700 rounded-lg p-1';
    
    this.patternModeButton = document.createElement('button');
    this.patternModeButton.className = 'px-3 py-1 text-sm rounded-md transition-colors';
    this.patternModeButton.textContent = 'Pattern';
    
    this.songModeButton = document.createElement('button');
    this.songModeButton.className = 'px-3 py-1 text-sm rounded-md transition-colors';
    this.songModeButton.textContent = 'Song';
    
    modeDiv.appendChild(this.patternModeButton);
    modeDiv.appendChild(this.songModeButton);
    
    // Tempo and time signature
    const tempoDiv = document.createElement('div');
    tempoDiv.className = 'flex items-center space-x-4';
    
    const tempoLabel = document.createElement('span');
    tempoLabel.className = 'text-sm text-slate-300';
    tempoLabel.textContent = 'BPM:';
    
    this.tempoInput = document.createElement('input');
    this.tempoInput.type = 'number';
    this.tempoInput.className = 'w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white';
    this.tempoInput.min = '40';
    this.tempoInput.max = '200';
    this.tempoInput.step = '0.1';
    
    const timeSigLabel = document.createElement('span');
    timeSigLabel.className = 'text-sm text-slate-300';
    timeSigLabel.textContent = 'Time:';
    
    this.timeSigInput = document.createElement('input');
    this.timeSigInput.type = 'text';
    this.timeSigInput.className = 'w-12 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white';
    this.timeSigInput.placeholder = '4/4';
    
    tempoDiv.appendChild(tempoLabel);
    tempoDiv.appendChild(this.tempoInput);
    tempoDiv.appendChild(timeSigLabel);
    tempoDiv.appendChild(this.timeSigInput);
    
    // Position and info display
    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex items-center space-x-4';
    
    this.positionDisplay = document.createElement('div');
    this.positionDisplay.className = 'text-sm text-slate-300 font-mono';
    
    this.bpmDisplay = document.createElement('div');
    this.bpmDisplay.className = 'text-sm text-slate-300';
    
    infoDiv.appendChild(this.positionDisplay);
    infoDiv.appendChild(this.bpmDisplay);
    
    // Assemble layout
    this.container.appendChild(controlsDiv);
    this.container.appendChild(modeDiv);
    this.container.appendChild(tempoDiv);
    this.container.appendChild(infoDiv);
  }

  private setupEventListeners(): void {
    // Transport controls
    this.playButton.addEventListener('click', () => {
      const transport = useStore.getState().transport;
      if (transport.playing) playbackService.pause();
      else playbackService.play();
    });
    
    this.stopButton.addEventListener('click', () => {
      playbackService.stop();
    });
    
    this.recordButton.addEventListener('click', () => {
      // Placeholder: record toggle not implemented in store yet
      console.log('Record toggle not implemented');
    });
    
    // Mode switching
    this.patternModeButton.addEventListener('click', () => {
      const actions = useActions();
      actions.setTransportMode('pattern');
    });
    
    this.songModeButton.addEventListener('click', () => {
      const actions = useActions();
      actions.setTransportMode('song');
    });
    
    // Tempo and time signature
    this.tempoInput.addEventListener('change', () => {
      const bpm = parseFloat(this.tempoInput.value);
      if (bpm >= 40 && bpm <= 200) {
        const actions = useActions();
        actions.setBpm(bpm);
      }
    });
    
    this.timeSigInput.addEventListener('change', () => {
      // Not yet implemented in store; placeholder parse
      const timeSigStr = this.timeSigInput.value;
      console.log('Time signature change requested:', timeSigStr);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target === this.tempoInput || e.target === this.timeSigInput) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.playButton.click();
          break;
        case 'Escape':
          e.preventDefault();
          this.stopButton.click();
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.recordButton.click();
          }
          break;
      }
    });
  }

  render(): void {
    const transport = useStore.getState().transport;
    const project = useStore.getState().project;
    
    // Update play button
    if (transport.playing) {
      this.playButton.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/></svg>';
      this.playButton.className = 'w-10 h-10 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full flex items-center justify-center';
    } else {
      this.playButton.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5v10l8-5-8-5z"/></svg>';
      this.playButton.className = 'w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center';
    }
    
    // Update record button
    if (transport.recording) {
      this.recordButton.className = 'w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center';
    } else {
      this.recordButton.className = 'w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center';
    }
    
    // Update mode buttons
    if (transport.mode === 'pattern') {
      this.patternModeButton.className = 'px-3 py-1 text-sm rounded-md bg-blue-600 text-white';
      this.songModeButton.className = 'px-3 py-1 text-sm rounded-md text-slate-300 hover:text-white';
    } else {
      this.patternModeButton.className = 'px-3 py-1 text-sm rounded-md text-slate-300 hover:text-white';
      this.songModeButton.className = 'px-3 py-1 text-sm rounded-md bg-blue-600 text-white';
    }
    
    // Update tempo and time signature
    this.tempoInput.value = project.bpm.toString();
    this.timeSigInput.value = `${project.timeSig[0]}/${project.timeSig[1]}`;
    
    // Update position display
    const position = this.formatPosition(transport.position, project);
    this.positionDisplay.textContent = position;
    
    // Update BPM display
    this.bpmDisplay.textContent = `${project.bpm} BPM`;
  }

  private formatPosition(position: number, project: Project): string {
    const ppq = project.ppq;
    const [numerator, denominator] = project.timeSig;
    
    const beats = position / ppq;
    const bars = Math.floor(beats / numerator);
    const beatsInBar = Math.floor(beats % numerator);
    const ticksInBeat = Math.floor(position % ppq);
    
    return `${bars.toString().padStart(3, '0')}:${beatsInBar.toString().padStart(2, '0')}:${ticksInBeat.toString().padStart(2, '0')}`;
  }

  // Public method to update display (called from store subscription)
  updateDisplay(): void {
    this.render();
  }
}

// Legacy compatibility
export function mountTransport(container: HTMLElement): Transport {
  return new Transport(container);
}
