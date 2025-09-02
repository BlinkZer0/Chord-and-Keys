import { useStore, useActions } from '../store';
import { audioEngine } from '../engine/audio-engine';
import type { ID } from '../engine/types';

export class Mixer {
  private container: HTMLElement;
  private channels: Map<ID, HTMLElement> = new Map();
  private masterChannel: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupLayout();
    this.setupEventListeners();
    this.render();
  }

  private setupLayout(): void {
    this.container.className = 'flex h-full bg-slate-900 border border-slate-700 rounded-md overflow-x-auto';
    
    // Create master channel
    this.masterChannel = this.createChannelElement('master', 'Master');
    this.masterChannel.className += ' bg-slate-800 border-r border-slate-600';
    this.container.appendChild(this.masterChannel);
    
    // Create channel strips
    this.createChannelStrips();
  }

  private createChannelStrips(): void {
    const mixer = useStore.getState().project.mixer;
    const ids = Object.keys(mixer.channels)
      .filter(id => id !== mixer.masterId)
      .sort((a, b) => {
        const na = parseInt((a.split('-')[1] || '0'), 10);
        const nb = parseInt((b.split('-')[1] || '0'), 10);
        return na - nb;
      });
    ids.forEach((id) => {
      const ch = mixer.channels[id];
      const el = this.createChannelElement(id as ID, ch.name || id);
      this.channels.set(id as ID, el);
      this.container.appendChild(el);
    });
  }

  private percentToDb(percent: number): number {
    const clamped = Math.max(0, Math.min(100, percent));
    return -60 + (clamped / 100) * 60; // -60 dB .. 0 dB
  }

  private dbToPercent(db: number): number {
    const clamped = Math.max(-60, Math.min(0, db));
    return ((clamped + 60) / 60) * 100;
  }

  private createChannelElement(channelId: ID, name: string): HTMLElement {
    const channelDiv = document.createElement('div');
    channelDiv.className = 'w-20 h-full bg-slate-800 border-r border-slate-700 flex flex-col items-center p-2 flex-shrink-0';
    
    // Channel name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'text-xs text-slate-300 text-center mb-2 truncate w-full';
    nameDiv.textContent = name;
    channelDiv.appendChild(nameDiv);
    
    // Volume fader
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'flex-1 flex flex-col items-center justify-center w-full';
    
    const volumeFader = document.createElement('input');
    volumeFader.type = 'range';
    volumeFader.className = 'w-8 h-32 bg-slate-700 rounded-lg appearance-none cursor-pointer';
    volumeFader.min = '0';
    volumeFader.max = '100';
    volumeFader.value = '80';
    volumeFader.orientation = 'vertical';
    volumeFader.setAttribute('data-channel', channelId);
    volumeFader.setAttribute('data-control', 'volume');
    
    const volumeLabel = document.createElement('div');
    volumeLabel.className = 'text-xs text-slate-400 mt-1';
    volumeLabel.textContent = '80%';
    
    volumeContainer.appendChild(volumeFader);
    volumeContainer.appendChild(volumeLabel);
    channelDiv.appendChild(volumeContainer);
    
    // Pan control
    const panContainer = document.createElement('div');
    panContainer.className = 'flex flex-col items-center mt-2';
    
    const panLabel = document.createElement('div');
    panLabel.className = 'text-xs text-slate-400 mb-1';
    panLabel.textContent = 'Pan';
    
    const panControl = document.createElement('input');
    panControl.type = 'range';
    panControl.className = 'w-12 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer';
    panControl.min = '-50';
    panControl.max = '50';
    panControl.value = '0';
    panControl.setAttribute('data-channel', channelId);
    panControl.setAttribute('data-control', 'pan');
    
    const panValue = document.createElement('div');
    panValue.className = 'text-xs text-slate-400 mt-1';
    panValue.textContent = 'C';
    
    panContainer.appendChild(panLabel);
    panContainer.appendChild(panControl);
    panContainer.appendChild(panValue);
    channelDiv.appendChild(panContainer);
    
    // Stereo width control
    const widthContainer = document.createElement('div');
    widthContainer.className = 'flex flex-col items-center mt-2';
    const widthLabel = document.createElement('div');
    widthLabel.className = 'text-xs text-slate-400 mb-1';
    widthLabel.textContent = 'Width';
    const widthControl = document.createElement('input');
    widthControl.type = 'range';
    widthControl.className = 'w-12 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer';
    widthControl.min = '0';
    widthControl.max = '100';
    widthControl.value = '0';
    widthControl.setAttribute('data-channel', channelId);
    widthControl.setAttribute('data-control', 'width');
    widthContainer.appendChild(widthLabel);
    widthContainer.appendChild(widthControl);
    channelDiv.appendChild(widthContainer);
    
    // Mute/Solo buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex space-x-1 mt-2';
    
    const muteButton = document.createElement('button');
    muteButton.className = 'w-6 h-6 bg-red-600 hover:bg-red-700 text-white text-xs rounded';
    muteButton.textContent = 'M';
    muteButton.setAttribute('data-channel', channelId);
    muteButton.setAttribute('data-control', 'mute');
    
    const soloButton = document.createElement('button');
    soloButton.className = 'w-6 h-6 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded';
    soloButton.textContent = 'S';
    soloButton.setAttribute('data-channel', channelId);
    soloButton.setAttribute('data-control', 'solo');
    
    buttonContainer.appendChild(muteButton);
    buttonContainer.appendChild(soloButton);
    channelDiv.appendChild(buttonContainer);
    
    // Phase invert toggle
    const phaseButton = document.createElement('button');
    phaseButton.className = 'w-12 h-6 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded mt-2';
    phaseButton.textContent = 'Phase';
    phaseButton.setAttribute('data-channel', channelId);
    phaseButton.setAttribute('data-control', 'phase');
    channelDiv.appendChild(phaseButton);
    
    // Effects sends
    const sendsContainer = document.createElement('div');
    sendsContainer.className = 'flex flex-col space-y-1 mt-2';
    
    // Reverb send
    const reverbContainer = document.createElement('div');
    reverbContainer.className = 'flex flex-col items-center';
    
    const reverbLabel = document.createElement('div');
    reverbLabel.className = 'text-xs text-slate-400';
    reverbLabel.textContent = 'R';
    
    const reverbSend = document.createElement('input');
    reverbSend.type = 'range';
    reverbSend.className = 'w-8 h-12 bg-slate-700 rounded appearance-none cursor-pointer';
    reverbSend.min = '0';
    reverbSend.max = '100';
    reverbSend.value = '0';
    reverbSend.setAttribute('data-channel', channelId);
    reverbSend.setAttribute('data-control', 'reverb');
    
    const reverbValue = document.createElement('div');
    reverbValue.className = 'text-xs text-slate-400';
    reverbValue.textContent = '0%';
    
    reverbContainer.appendChild(reverbLabel);
    reverbContainer.appendChild(reverbSend);
    reverbContainer.appendChild(reverbValue);
    sendsContainer.appendChild(reverbContainer);
    
    // Delay send
    const delayContainer = document.createElement('div');
    delayContainer.className = 'flex flex-col items-center';
    
    const delayLabel = document.createElement('div');
    delayLabel.className = 'text-xs text-slate-400';
    delayLabel.textContent = 'D';
    
    const delaySend = document.createElement('input');
    delaySend.type = 'range';
    delaySend.className = 'w-8 h-12 bg-slate-700 rounded appearance-none cursor-pointer';
    delaySend.min = '0';
    delaySend.max = '100';
    delaySend.value = '0';
    delaySend.setAttribute('data-channel', channelId);
    delaySend.setAttribute('data-control', 'delay');
    
    const delayValue = document.createElement('div');
    delayValue.className = 'text-xs text-slate-400';
    delayValue.textContent = '0%';
    
    delayContainer.appendChild(delayLabel);
    delayContainer.appendChild(delaySend);
    delayContainer.appendChild(delayValue);
    sendsContainer.appendChild(delayContainer);

    // Bus send (to another insert)
    const busSendContainer = document.createElement('div');
    busSendContainer.className = 'flex flex-col items-center mt-2';
    const busSendLabel = document.createElement('div');
    busSendLabel.className = 'text-xs text-slate-400';
    busSendLabel.textContent = 'Send';
    const sendTarget = document.createElement('select');
    sendTarget.className = 'w-16 bg-slate-700 border border-slate-600 rounded text-xs';
    sendTarget.setAttribute('data-channel', channelId);
    sendTarget.setAttribute('data-control', 'send-target');
    // Populate options
    const mixer = useStore.getState().project.mixer;
    const ids = Object.keys(mixer.channels).filter(id => id !== mixer.masterId && id !== channelId).sort((a,b)=>{
      const na = parseInt((a.split('-')[1]||'0'),10); const nb = parseInt((b.split('-')[1]||'0'),10); return na-nb;
    });
    const noneOpt = document.createElement('option'); noneOpt.value = ''; noneOpt.text = 'None';
    sendTarget.appendChild(noneOpt);
    ids.forEach(id => { const opt = document.createElement('option'); opt.value = id; opt.text = mixer.channels[id].name; sendTarget.appendChild(opt); });
    const sendAmount = document.createElement('input');
    sendAmount.type = 'range';
    sendAmount.className = 'w-12 h-2 bg-slate-700 rounded appearance-none cursor-pointer mt-1';
    sendAmount.min = '0'; sendAmount.max = '100'; sendAmount.value = '0';
    sendAmount.setAttribute('data-channel', channelId);
    sendAmount.setAttribute('data-control', 'send-amount');
    busSendContainer.appendChild(busSendLabel);
    busSendContainer.appendChild(sendTarget);
    busSendContainer.appendChild(sendAmount);
    sendsContainer.appendChild(busSendContainer);
    
    channelDiv.appendChild(sendsContainer);
    
    // Simple level meter
    const meter = document.createElement('div');
    meter.className = 'w-2 h-24 mt-2 bg-slate-700 rounded relative overflow-hidden';
    const meterFill = document.createElement('div');
    meterFill.className = 'absolute bottom-0 left-0 right-0 bg-green-500';
    meterFill.style.height = '0%';
    meter.setAttribute('data-control', 'meter');
    meter.appendChild(meterFill);
    channelDiv.appendChild(meter);
    
    return channelDiv;
  }

  private setupEventListeners(): void {
    // Volume fader events
    this.container.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const channelId = target.getAttribute('data-channel');
      const control = target.getAttribute('data-control');
      
      if (!channelId || !control) return;
      
      const actions = useActions();
      const value = parseFloat(target.value);
      
      switch (control) {
        case 'volume':
          actions.setMixerChannel(channelId, { gainDb: this.percentToDb(value) } as any);
          this.updateVolumeDisplay(channelId, value);
          break;
        case 'pan':
          actions.setMixerChannel(channelId, { pan: value / 50 });
          this.updatePanDisplay(channelId, value);
          break;
        case 'width':
          actions.setMixerChannel(channelId, { stereoSeparation: value / 100 } as any);
          break;
        case 'reverb':
          actions.setMixerChannel(channelId, { reverbSend: value / 100 } as any);
          this.updateSendDisplay(channelId, 'reverb', value);
          break;
        case 'delay':
          actions.setMixerChannel(channelId, { delaySend: value / 100 } as any);
          this.updateSendDisplay(channelId, 'delay', value);
          break;
        case 'send-amount':
          // Update or create first send with current target
          {
            const mixer = useStore.getState().project.mixer;
            const channel = mixer.channels[channelId];
            const selectEl = this.container.querySelector(`select[data-control="send-target"][data-channel="${channelId}"]`) as HTMLSelectElement;
            const targetId = selectEl?.value || '';
            const sends = [...(channel.sends || [])].filter(s => s.targetBusId !== targetId);
            if (targetId) sends.push({ id: 'send-1', targetBusId: targetId, amount: value/100 } as any);
            actions.setMixerChannel(channelId, { sends } as any);
          }
          break;
      }
    });
    
    // Mute/Solo button events
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const channelId = target.getAttribute('data-channel');
      const control = target.getAttribute('data-control');
      
      if (!channelId || !control) return;
      
      const actions = useActions();
      const mixer = useStore.getState().project.mixer;
      const channel = mixer.channels[channelId];
      if (!channel) return;

      switch (control) {
        case 'mute':
          actions.setMixerChannel(channelId, { mute: !(channel as any).mute });
          this.updateMuteButton(channelId, !(channel as any).mute as boolean);
          break;
        case 'solo':
          actions.setMixerChannel(channelId, { solo: !(channel as any).solo });
          this.updateSoloButton(channelId, !(channel as any).solo as boolean);
          break;
        case 'phase':
          actions.setMixerChannel(channelId, { phaseInvert: !((channel as any).phaseInvert) } as any);
          break;
      }
    });

    // Send target change
    this.container.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const channelId = target.getAttribute('data-channel');
      const control = target.getAttribute('data-control');
      if (!channelId || control !== 'send-target') return;
      const actions = useActions();
      const mixer = useStore.getState().project.mixer;
      const channel = mixer.channels[channelId];
      const amountEl = this.container.querySelector(`input[data-control="send-amount"][data-channel="${channelId}"]`) as HTMLInputElement;
      const amount = amountEl ? parseFloat(amountEl.value)/100 : 0;
      const targetId = target.value || '';
      const sends = [...(channel.sends || [])].filter(s => s.targetBusId !== targetId);
      if (targetId) sends.push({ id: 'send-1', targetBusId: targetId, amount } as any);
      actions.setMixerChannel(channelId, { sends } as any);
    });
  }

  private updateVolumeDisplay(channelId: ID, value: number): void {
    const channelElement = this.channels.get(channelId) || this.masterChannel;
    const volumeLabel = channelElement.querySelector('[data-control="volume"] + div') as HTMLElement;
    if (volumeLabel) {
      volumeLabel.textContent = `${Math.round(value)}%`;
    }
  }

  private updatePanDisplay(channelId: ID, value: number): void {
    const channelElement = this.channels.get(channelId) || this.masterChannel;
    const panValue = channelElement.querySelector('[data-control="pan"] + div') as HTMLElement;
    if (panValue) {
      if (value === 0) {
        panValue.textContent = 'C';
      } else if (value < 0) {
        panValue.textContent = `L${Math.abs(value)}`;
      } else {
        panValue.textContent = `R${value}`;
      }
    }
  }

  private updateSendDisplay(channelId: ID, sendType: string, value: number): void {
    const channelElement = this.channels.get(channelId) || this.masterChannel;
    const sendElement = channelElement.querySelector(`[data-control="${sendType}"]`) as HTMLInputElement;
    const valueElement = sendElement?.nextElementSibling as HTMLElement;
    if (valueElement) {
      valueElement.textContent = `${Math.round(value)}%`;
    }
  }

  private updateMuteButton(channelId: ID, muted: boolean): void {
    const channelElement = this.channels.get(channelId) || this.masterChannel;
    const muteButton = channelElement.querySelector('[data-control="mute"]') as HTMLButtonElement;
    if (muteButton) {
      muteButton.className = muted 
        ? 'w-6 h-6 bg-red-700 text-white text-xs rounded' 
        : 'w-6 h-6 bg-red-600 hover:bg-red-700 text-white text-xs rounded';
    }
  }

  private updateSoloButton(channelId: ID, soloed: boolean): void {
    const channelElement = this.channels.get(channelId) || this.masterChannel;
    const soloButton = channelElement.querySelector('[data-control="solo"]') as HTMLButtonElement;
    if (soloButton) {
      soloButton.className = soloed 
        ? 'w-6 h-6 bg-yellow-700 text-white text-xs rounded' 
        : 'w-6 h-6 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded';
    }
  }

  render(): void {
    const mixer = useStore.getState().project.mixer;
    
    // Update all channel displays
    Object.entries(mixer.channels).forEach(([channelId, channel]) => {
      const channelElement = this.channels.get(channelId);
      if (!channelElement) return;
      
      // Update volume fader
      const volumeFader = channelElement.querySelector('[data-control="volume"]') as HTMLInputElement;
      if (volumeFader) {
        const percent = this.dbToPercent(channel.gainDb ?? 0);
        volumeFader.value = percent.toString();
        this.updateVolumeDisplay(channelId, percent);
      }
      
      // Update pan control
      const panControl = channelElement.querySelector('[data-control="pan"]') as HTMLInputElement;
      if (panControl) {
        const panPercent = Math.round((channel.pan ?? 0) * 50);
        panControl.value = panPercent.toString();
        this.updatePanDisplay(channelId, panPercent);
      }
      
      // Update mute/solo buttons
      this.updateMuteButton(channelId, (channel as any).mute as boolean);
      this.updateSoloButton(channelId, (channel as any).solo as boolean);
      
      // Update effects sends
      const reverbSend = channelElement.querySelector('[data-control="reverb"]') as HTMLInputElement;
      if (reverbSend) {
        const rv = Math.round(((channel as any).reverbSend ?? 0) * 100);
        reverbSend.value = rv.toString();
        this.updateSendDisplay(channelId, 'reverb', rv);
      }
      
      const delaySend = channelElement.querySelector('[data-control="delay"]') as HTMLInputElement;
      if (delaySend) {
        const dv = Math.round(((channel as any).delaySend ?? 0) * 100);
        delaySend.value = dv.toString();
        this.updateSendDisplay(channelId, 'delay', dv);
      }
    });
    
    // Update master channel
    const masterChannel = mixer.channels[mixer.masterId];
    if (masterChannel) {
      const volumeFader = this.masterChannel.querySelector('[data-control="volume"]') as HTMLInputElement;
      if (volumeFader) {
        const percent = this.dbToPercent(masterChannel.gainDb ?? 0);
        volumeFader.value = percent.toString();
        this.updateVolumeDisplay('master', percent);
      }
    }

    // Update meters
    this.channels.forEach((el, id) => {
      const meterFill = el.querySelector('[data-control="meter"] > div') as HTMLElement;
      if (meterFill) {
        const level = audioEngine.getInsertLevel(id);
        meterFill.style.height = `${Math.round(level * 100)}%`;
      }
    });
  }

  // Public method to update display (called from store subscription)
  updateDisplay(): void {
    this.render();
  }
}

// Legacy compatibility
export function mountMixer(container: HTMLElement): Mixer {
  return new Mixer(container);
}
