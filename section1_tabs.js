// Section 1: Tab Management System
// Handles switching between Chord, Scale/Mode, and Sequencer modes

class Section1Tabs {
  constructor() {
    this.mode = 'Chord';
    this.elements = {};
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupTabs());
    } else {
      this.setupTabs();
    }
  }

  setupTabs() {
    // Get DOM elements
    this.elements = {
      btnModeChord: document.getElementById('btnModeChord'),
      btnModeScale: document.getElementById('btnModeScale'),
      btnModeSequencer: document.getElementById('btnModeSequencer'),
      wrapChord: document.getElementById('wrapChord'),
      wrapScale: document.getElementById('wrapScale'),
      listenChord: document.getElementById('listenChord'),
      listenScale: document.getElementById('listenScale'),
      sequencerHost: document.getElementById('sequencerHost')
    };

    // Verify all elements exist
    const missingElements = Object.entries(this.elements)
      .filter(([name, element]) => !element)
      .map(([name]) => name);

    if (missingElements.length > 0) {
      console.error('Section1Tabs: Missing elements:', missingElements);
      return;
    }

    // Add event listeners
    this.elements.btnModeChord.addEventListener('click', () => this.switchToMode('Chord'));
    this.elements.btnModeScale.addEventListener('click', () => this.switchToMode('Scale/Mode'));
    this.elements.btnModeSequencer.addEventListener('click', () => this.switchToMode('Sequencer'));

    // Initialize with default mode
    this.switchToMode(this.mode);
  }

  switchToMode(newMode) {
    this.mode = newMode;
    
    // Update button styles
    const buttons = {
      'Chord': this.elements.btnModeChord,
      'Scale/Mode': this.elements.btnModeScale,
      'Sequencer': this.elements.btnModeSequencer
    };

    Object.entries(buttons).forEach(([mode, button]) => {
      if (button) {
        if (mode === newMode) {
          button.className = 'px-3 py-2 text-sm bg-slate-700/70';
        } else {
          button.className = 'px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
        }
      }
    });

    // Show/hide appropriate sections
    if (newMode === 'Chord') {
      this.elements.wrapChord.classList.remove('hidden');
      this.elements.wrapScale.classList.add('hidden');
      this.elements.listenChord.classList.remove('hidden');
      this.elements.listenScale.classList.add('hidden');
      this.elements.sequencerHost.classList.add('hidden');
    } else if (newMode === 'Scale/Mode') {
      this.elements.wrapScale.classList.remove('hidden');
      this.elements.wrapChord.classList.add('hidden');
      this.elements.listenScale.classList.remove('hidden');
      this.elements.listenChord.classList.add('hidden');
      this.elements.sequencerHost.classList.add('hidden');
    } else if (newMode === 'Sequencer') {
      this.elements.wrapChord.classList.add('hidden');
      this.elements.wrapScale.classList.add('hidden');
      this.elements.listenChord.classList.add('hidden');
      this.elements.listenScale.classList.add('hidden');
      this.elements.sequencerHost.classList.remove('hidden');
    }

    // Trigger global update if available
    if (typeof window.updateAll === 'function') {
      window.updateAll();
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: newMode } }));
  }

  getCurrentMode() {
    return this.mode;
  }
}

// Initialize when script loads
window.Section1Tabs = new Section1Tabs();
