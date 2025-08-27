// Section 2: Instrument Visualization System
// Handles piano and other instrument visualizations

class Section2Instruments {
  constructor() {
    this.instrument = 'Piano';
    this.hosts = {};
    this.currentHost = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupInstruments());
    } else {
      this.setupInstruments();
    }
  }

  setupInstruments() {
    // Get all instrument hosts
    this.hosts = {
      piano: document.getElementById('pianoHost'),
      guitar: document.getElementById('guitarHost'),
      bass: document.getElementById('bassHost'),
      violin: document.getElementById('violinHost'),
      flute: document.getElementById('fluteHost'),
      recorder: document.getElementById('recorderHost'),
      trumpet: document.getElementById('trumpetHost'),
      saxophone: document.getElementById('saxophoneHost'),
      koto: document.getElementById('kotoHost'),
      ney: document.getElementById('neyHost')
    };

    // Verify hosts exist
    const missingHosts = Object.entries(this.hosts)
      .filter(([name, host]) => !host)
      .map(([name]) => name);

    if (missingHosts.length > 0) {
      console.error('Section2Instruments: Missing hosts:', missingHosts);
      return;
    }

    // Listen for instrument changes
    const instrumentSelect = document.getElementById('selInstr');
    if (instrumentSelect) {
      instrumentSelect.addEventListener('change', (e) => {
        this.switchInstrument(e.target.value);
      });
    }

    // Listen for mode changes from section 1
    window.addEventListener('modeChanged', (e) => {
      // Refresh instruments when mode changes
      this.refreshInstruments();
    });

    // Initialize with default instrument
    this.switchInstrument(this.instrument);
  }

  switchInstrument(newInstrument) {
    this.instrument = newInstrument;
    
    // Hide all hosts
    Object.values(this.hosts).forEach(host => {
      if (host) {
        host.classList.add('hidden');
      }
    });

    // Show appropriate host
    const hostMap = {
      'Piano': this.hosts.piano,
      'Guitar': this.hosts.guitar,
      'Bass': this.hosts.bass,
      'Violin': this.hosts.violin,
      'Flute': this.hosts.flute,
      'Recorder': this.hosts.recorder,
      'Trumpet': this.hosts.trumpet,
      'Saxophone': this.hosts.saxophone,
      'Koto': this.hosts.koto,
      'Ney': this.hosts.ney
    };

    this.currentHost = hostMap[newInstrument];
    if (this.currentHost) {
      this.currentHost.classList.remove('hidden');
    }

    // Update instrument icon if function exists
    if (typeof window.updateInstrumentIcon === 'function') {
      window.updateInstrumentIcon();
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('instrumentChanged', { 
      detail: { instrument: newInstrument } 
    }));
  }

  refreshInstruments() {
    // Rebuild piano if function exists
    if (typeof window.buildPiano === 'function') {
      window.buildPiano();
    }

    // Refresh instruments if function exists
    if (typeof window.refreshInstruments === 'function') {
      window.refreshInstruments();
    }

    // Update all if function exists
    if (typeof window.updateAll === 'function') {
      window.updateAll();
    }
  }

  getCurrentInstrument() {
    return this.instrument;
  }

  getCurrentHost() {
    return this.currentHost;
  }
}

// Initialize when script loads
window.Section2Instruments = new Section2Instruments();
