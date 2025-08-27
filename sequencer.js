// ========================= SEQUENCER: Core Engine =========================

// Audio engine with improved instrument handling
const masterLim = new Tone.Limiter(-1).toDestination();

// Enhanced instrument creation with better error handling
function makeSynth(type, env, options = {}) {
  const panner = new Tone.Panner(0).connect(masterLim);
  let destination = panner;
  let vib = null, trem = null, filter = null;

  // Add filter if specified in env
  if (env.filter) {
    filter = new Tone.Filter(env.filter.frequency, env.filter.type || 'lowpass', env.filter.rolloff || -12).connect(destination);
    filter.Q.value = env.filter.Q;
    destination = filter;
  }

  // Use env settings for vibrato/tremolo if available
  if (env.vibrato || options.vibrato) {
    const vRate = env.vibrato?.rate || options.vibratoRate || 5;
    const vDepth = env.vibrato?.depth || options.vibratoDepth || 0.1;
    vib = new Tone.Vibrato(vRate, vDepth).connect(destination);
    destination = vib;
  }
  if (env.tremolo || options.tremolo) {
    const tRate = env.tremolo?.rate || options.tremoloRate || 5;
    const tDepth = env.tremolo?.depth || options.tremoloDepth || 0.5;
    trem = new Tone.Tremolo(tRate, tDepth).start().connect(destination);
    destination = trem;
  }

  const gain = new Tone.Gain(1).connect(destination);
  let synth;

  const synthOptions = {
    envelope: { attack: env.a, decay: env.d, sustain: env.s, release: env.r },
    oscillator: { type: env.osc }
  };

  try {
    switch (type) {
      case 'PolySynth':
        synth = new Tone.PolySynth(Tone.Synth, synthOptions).connect(gain);
        break;
      case 'MonoSynth':
        synth = new Tone.MonoSynth(synthOptions).connect(gain);
        break;
      case 'DuoSynth':
        synth = new Tone.DuoSynth({ ...synthOptions, ...options.duoOptions }).connect(gain);
        break;
      case 'AMSynth':
        synth = new Tone.AMSynth({ ...synthOptions, ...options.amOptions }).connect(gain);
        break;
      case 'PluckSynth':
        synth = new Tone.PluckSynth(options.pluckOptions).connect(gain);
        break;
      default:
        console.warn(`Unknown synth type: ${type}. Defaulting to PolySynth.`);
        synth = new Tone.PolySynth(Tone.Synth, synthOptions).connect(gain);
    }
  } catch (error) {
    console.error(`Failed to create ${type} synth:`, error);
    // Fallback to basic synth
    synth = new Tone.PolySynth(Tone.Synth, synthOptions).connect(gain);
  }

  return {
    trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
      try {
        const freq = midiToFreq(midi);
        const vel = Math.max(0.1, Math.min(1, velocity));
        if (type !== 'PluckSynth') {
          synth.triggerAttackRelease(freq, dur, time, vel);
        } else {
          synth.triggerAttack(freq, time, vel);
        }
      } catch (e) {
        console.warn(`${type} trigger error:`, e);
      }
    },
    release(midi, time = Tone.now()) {
      if (type !== 'PluckSynth') {
        try {
          synth.triggerRelease(midiToFreq(midi), time);
        } catch (e) {
          console.warn(`${type} release error:`, e);
        }
      }
    },
    setVolume(v) { 
      try {
        gain.gain.value = Math.max(0, Math.min(1, v)); 
      } catch (e) {
        console.warn('Volume set error:', e);
      }
    },
    setPan(p) { 
      try {
        panner.pan.value = Math.max(-1, Math.min(1, p)); 
      } catch (e) {
        console.warn('Pan set error:', e);
      }
    },
    setVibrato(rate, depth) { 
      if (vib) { 
        try {
          vib.frequency.value = rate; 
          vib.depth = depth; 
        } catch (e) {
          console.warn('Vibrato set error:', e);
        }
      } 
    },
    setTremolo(rate, depth) { 
      if (trem) { 
        try {
          trem.frequency.value = rate; 
          trem.depth = depth; 
        } catch (e) {
          console.warn('Tremolo set error:', e);
        }
      } 
    },
    dispose() { 
      try {
        synth.dispose(); 
        gain.dispose(); 
        if (vib) vib.dispose(); 
        if (trem) trem.dispose(); 
        if (filter) filter.dispose(); 
        panner.dispose(); 
      } catch (e) {
        console.warn('Dispose error:', e);
      }
    }
  };
}

// Enhanced instrument registry with better error handling
const SEQ_INSTR = {
  Piano: () => {
    try {
      // Try sample first, fallback to synth
      if (window.sampleLibrary && window.sampleLibrary.piano) {
        const panner = new Tone.Panner(0).connect(masterLim);
        const gain = new Tone.Gain(1).connect(panner);
        const sampler = window.sampleLibrary.piano;
        sampler.disconnect();
        sampler.connect(gain);
        
        return {
          trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
            try {
              const freq = midiToFreq(midi);
              const vel = Math.max(0.1, Math.min(1, velocity));
              sampler.triggerAttackRelease(freq, dur, time, vel);
            } catch (e) {
              console.warn('Piano sampler trigger error:', e);
            }
          },
          release(midi, time = Tone.now()) {
            try {
              sampler.triggerRelease(midiToFreq(midi), time);
            } catch (e) {
              // Ignore release errors for samplers
            }
          },
          setVolume(v) { gain.gain.value = Math.max(0, Math.min(1, v)); },
          setPan(p) { panner.pan.value = Math.max(-1, Math.min(1, p)); },
          dispose() { 
            if (sampler) sampler.disconnect();
            gain.dispose(); 
            panner.dispose(); 
          }
        };
      }
    } catch (e) {
      console.warn('Piano sample failed, using synth:', e);
    }
    return makeSynth('PolySynth', ENV.Piano);
  },
  
  Guitar: () => {
    try {
      if (window.sampleLibrary && window.sampleLibrary.guitar) {
        const panner = new Tone.Panner(0).connect(masterLim);
        const gain = new Tone.Gain(1).connect(panner);
        const sampler = window.sampleLibrary.guitar;
        sampler.disconnect();
        sampler.connect(gain);
        
        return {
          trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
            try {
              const freq = midiToFreq(midi);
              const vel = Math.max(0.1, Math.min(1, velocity));
              sampler.triggerAttackRelease(freq, dur, time, vel);
            } catch (e) {
              console.warn('Guitar sampler trigger error:', e);
            }
          },
          release(midi, time = Tone.now()) {
            try {
              sampler.triggerRelease(midiToFreq(midi), time);
            } catch (e) {
              // Ignore release errors
            }
          },
          setVolume(v) { gain.gain.value = Math.max(0, Math.min(1, v)); },
          setPan(p) { panner.pan.value = Math.max(-1, Math.min(1, p)); },
          dispose() { 
            if (sampler) sampler.disconnect();
            gain.dispose(); 
            panner.dispose(); 
          }
        };
      }
    } catch (e) {
      console.warn('Guitar sample failed, using synth:', e);
    }
    return makeSynth('PluckSynth', {}, { 
      pluckOptions: { 
        attackNoise: 0.5, 
        dampening: 1800, 
        resonance: 0.8 
      } 
    });
  },
  
  Bass: () => makeSynth('MonoSynth', ENV.Bass),
  
  Violin: () => {
    try {
      if (window.sampleLibrary && window.sampleLibrary.violin) {
        const panner = new Tone.Panner(0).connect(masterLim);
        const gain = new Tone.Gain(1).connect(panner);
        const sampler = window.sampleLibrary.violin;
        sampler.disconnect();
        sampler.connect(gain);
        
        return {
          trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
            try {
              const freq = midiToFreq(midi);
              const vel = Math.max(0.1, Math.min(1, velocity));
              sampler.triggerAttackRelease(freq, dur, time, vel);
            } catch (e) {
              console.warn('Violin sampler trigger error:', e);
            }
          },
          release(midi, time = Tone.now()) {
            try {
              sampler.triggerRelease(midiToFreq(midi), time);
            } catch (e) {
              // Ignore release errors
            }
          },
          setVolume(v) { gain.gain.value = Math.max(0, Math.min(1, v)); },
          setPan(p) { panner.pan.value = Math.max(-1, Math.min(1, p)); },
          dispose() { 
            if (sampler) sampler.disconnect();
            gain.dispose(); 
            panner.dispose(); 
          }
        };
      }
    } catch (e) {
      console.warn('Violin sample failed, using synth:', e);
    }
    return makeSynth('PolySynth', ENV.Violin, { vibrato: true });
  },
  
  Flute: () => {
    try {
      if (window.sampleLibrary && window.sampleLibrary.flute) {
        const panner = new Tone.Panner(0).connect(masterLim);
        const gain = new Tone.Gain(1).connect(panner);
        const sampler = window.sampleLibrary.flute;
        sampler.disconnect();
        sampler.connect(gain);
        
        return {
          trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
            try {
              const freq = midiToFreq(midi);
              const vel = Math.max(0.1, Math.min(1, velocity));
              sampler.triggerAttackRelease(freq, dur, time, vel);
            } catch (e) {
              console.warn('Flute sampler trigger error:', e);
            }
          },
          release(midi, time = Tone.now()) {
            try {
              sampler.triggerRelease(midiToFreq(midi), time);
            } catch (e) {
              // Ignore release errors
            }
          },
          setVolume(v) { gain.gain.value = Math.max(0, Math.min(1, v)); },
          setPan(p) { panner.pan.value = Math.max(-1, Math.min(1, p)); },
          dispose() { 
            if (sampler) sampler.disconnect();
            gain.dispose(); 
            panner.dispose(); 
          }
        };
      }
    } catch (e) {
      console.warn('Flute sample failed, using synth:', e);
    }
    return makeSynth('PolySynth', ENV.Flute, { vibrato: true });
  },
  
  Recorder: () => makeSynth('PolySynth', ENV.Recorder),
  
  Trumpet: () => {
    try {
      if (window.sampleLibrary && window.sampleLibrary.trumpet) {
        const panner = new Tone.Panner(0).connect(masterLim);
        const gain = new Tone.Gain(1).connect(panner);
        const sampler = window.sampleLibrary.trumpet;
        sampler.disconnect();
        sampler.connect(gain);
        
        return {
          trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
            try {
              const freq = midiToFreq(midi);
              const vel = Math.max(0.1, Math.min(1, velocity));
              sampler.triggerAttackRelease(freq, dur, time, vel);
            } catch (e) {
              console.warn('Trumpet sampler trigger error:', e);
            }
          },
          release(midi, time = Tone.now()) {
            try {
              sampler.triggerRelease(midiToFreq(midi), time);
            } catch (e) {
              // Ignore release errors
            }
          },
          setVolume(v) { gain.gain.value = Math.max(0, Math.min(1, v)); },
          setPan(p) { panner.pan.value = Math.max(-1, Math.min(1, p)); },
          dispose() { 
            if (sampler) sampler.disconnect();
            gain.dispose(); 
            panner.dispose(); 
          }
        };
      }
    } catch (e) {
      console.warn('Trumpet sample failed, using synth:', e);
    }
    return makeSynth('PolySynth', ENV.Trumpet, { vibrato: true });
  },
  
  Saxophone: () => {
    try {
      if (window.sampleLibrary && window.sampleLibrary.saxophone) {
        const panner = new Tone.Panner(0).connect(masterLim);
        const gain = new Tone.Gain(1).connect(panner);
        const sampler = window.sampleLibrary.saxophone;
        sampler.disconnect();
        sampler.connect(gain);
        
        return {
          trigger(midi, time = Tone.now(), velocity = 1, dur = '8n') {
            try {
              const freq = midiToFreq(midi);
              const vel = Math.max(0.1, Math.min(1, velocity));
              sampler.triggerAttackRelease(freq, dur, time, vel);
            } catch (e) {
              console.warn('Saxophone sampler trigger error:', e);
            }
          },
          release(midi, time = Tone.now()) {
            try {
              sampler.triggerRelease(midiToFreq(midi), time);
            } catch (e) {
              // Ignore release errors
            }
          },
          setVolume(v) { gain.gain.value = Math.max(0, Math.min(1, v)); },
          setPan(p) { panner.pan.value = Math.max(-1, Math.min(1, p)); },
          dispose() { 
            if (sampler) sampler.disconnect();
            gain.dispose(); 
            panner.dispose(); 
          }
        };
      }
    } catch (e) {
      console.warn('Saxophone sample failed, using synth:', e);
    }
    return makeSynth('PolySynth', ENV.Saxophone, { vibrato: true });
  },
  
  Koto: () => makeSynth('PluckSynth', {}, { 
    pluckOptions: { 
      attackNoise: 0.2, 
      dampening: 2000, 
      resonance: 0.9 
    } 
  }),
  
  Oud: () => makeSynth('PluckSynth', {}, { 
    pluckOptions: { 
      attackNoise: 0.3, 
      dampening: 1500, 
      resonance: 0.85 
    } 
  }),
  
  Ney: () => makeSynth('PolySynth', ENV.Ney, { vibrato: true }),
  
  'Hammond Organ': () => makeSynth('PolySynth', ENV['Hammond Organ'], { tremolo: true })
};

// Enhanced instrument creation with better error handling
function createSeqInstrument(name) {
  try {
    const factory = SEQ_INSTR[name];
    if (factory) {
      return factory();
    }
    
    // Fallback to makePoly with appropriate envelope
    const env = ENV[name] || ENV.Piano;
    return makeSynth('PolySynth', env);
  } catch (error) {
    console.error(`Failed to create instrument ${name}:`, error);
    // Ultimate fallback
    return makeSynth('PolySynth', ENV.Piano);
  }
}

// Enhanced piano roll rendering with viewport culling for large files
function drawPianoRollEnhanced() {
  const clip = song.tracks[activeTrack].clips[0];
  
  // Auto-extend clip length if needed based on actual notes
  const maxNoteTick = Math.max(0, ...song.tracks.flatMap(t => 
    t.clips[0].notes.map(n => n.tick + n.dur)
  ));
  
  // For large MIDI files, add more substantial buffer
  const bufferSize = Math.max(192 * 8, Math.floor(maxNoteTick * 0.25));
  const minClipLength = Math.max(clip.length, maxNoteTick + bufferSize);
  if (minClipLength > clip.length) {
    song.tracks.forEach(t => t.clips[0].length = minClipLength);
  }
  
  const totalSteps = clip.length / SIXTEENTH;
  const noteCount = MAX_MIDI - MIN_MIDI;
  let cellW = 20 * ui.zoomX;
  const cellH = 20 * ui.zoomY;
  let totalWidth = totalSteps * cellW;
  
  // Handle extremely large MIDI files that exceed browser limits
  const maxBrowserWidth = 33554427; // Chrome/Firefox limit
  const maxBrowserHeight = 33554427;
  
  if (totalWidth > maxBrowserWidth) {
    console.warn('Large MIDI detected - totalWidth:', totalWidth, 'exceeds browser limit:', maxBrowserWidth);
    
    // Calculate maximum allowed zoom to fit within browser limits
    const maxZoomX = maxBrowserWidth / (totalSteps * 20);
    
    if (ui.zoomX > maxZoomX) {
      console.log('Reducing zoomX from', ui.zoomX, 'to', maxZoomX);
      ui.zoomX = Math.max(0.1, maxZoomX);
      seqZoomX.value = ui.zoomX;
      cellW = 20 * ui.zoomX;
      totalWidth = totalSteps * cellW;
      console.log('Adjusted totalWidth:', totalWidth);
    }
    
    // If still too large, truncate the display but keep the data
    if (totalWidth > maxBrowserWidth) {
      const maxSteps = Math.floor(maxBrowserWidth / (20 * ui.zoomX));
      const maxTicks = maxSteps * SIXTEENTH;
      console.warn('Truncating display to', maxSteps, 'steps, maxTicks:', maxTicks);
      totalWidth = maxBrowserWidth;
    }
  }
  
  // Check height limits as well
  const totalHeight = noteCount * cellH;
  if (totalHeight > maxBrowserHeight) {
    console.warn('Large MIDI detected - totalHeight:', totalHeight, 'exceeds browser limit:', maxBrowserHeight);
    const maxZoomY = maxBrowserHeight / (noteCount * 20);
    if (ui.zoomY > maxZoomY) {
      ui.zoomY = Math.max(0.1, maxZoomY);
      seqZoomY.value = ui.zoomY;
    }
  }
  
  const scrollLeft = pianoRollScroll.scrollLeft;
  const viewportWidth = pianoRollScroll.clientWidth;
  const startStep = Math.floor(scrollLeft / cellW);
  const endStep = startStep + Math.ceil(viewportWidth / cellW) + 1;
  const width = viewportWidth;
  const height = noteCount * cellH;
  const dpr = window.devicePixelRatio || 1;
  
  pianoRoll.width = width * dpr; 
  pianoRoll.height = height * dpr; 
  pianoRoll.style.width = width + 'px'; 
  pianoRoll.style.height = height + 'px';
  pianoRollSpacer.style.width = totalWidth + 'px'; 
  pianoRollSpacer.style.height = height + 'px';
  
  const ctx = pianoRoll.getContext('2d'); 
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); 
  ctx.clearRect(0, 0, width, height);
  
  // Background lanes
  for (let i = 0; i < noteCount; i++) { 
    ctx.fillStyle = i % 2 ? '#243341' : '#23303c'; 
    ctx.fillRect(0, i * cellH, width, cellH); 
  }
  
  // Grid vertical
  for (let i = startStep; i <= endStep; i++) {
    const x = i * cellW - scrollLeft; 
    ctx.strokeStyle = '#2d3c4a'; 
    if (i % (song.ppq / SIXTEENTH) === 0) ctx.strokeStyle = '#395063'; 
    if (i % (song.ts.num * song.ppq / SIXTEENTH) === 0) ctx.strokeStyle = '#4a6379'; 
    ctx.beginPath(); 
    ctx.moveTo(x, 0); 
    ctx.lineTo(x, height); 
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let j = 0; j <= noteCount; j++) { 
    const y = j * cellH; 
    ctx.strokeStyle = '#2d3c4a'; 
    ctx.beginPath(); 
    ctx.moveTo(0, y); 
    ctx.lineTo(width, y); 
    ctx.stroke(); 
  }
  
  // Enhanced viewport culling for large files
  const startTick = Math.floor(scrollLeft / cellW) * SIXTEENTH;
  const endTick = Math.ceil((scrollLeft + width) / cellW) * SIXTEENTH;
  const topMidi = MAX_MIDI - Math.floor(pianoRollScroll.scrollTop / cellH);
  const bottomMidi = MAX_MIDI - Math.ceil((pianoRollScroll.scrollTop + pianoRollScroll.clientHeight) / cellH);
  
  // Enhanced performance for large files - limit rendering to visible area with buffer
  const renderBuffer = 1000; // Buffer in ticks for smooth scrolling
  const renderStartTick = Math.max(0, startTick - renderBuffer);
  const renderEndTick = endTick + renderBuffer;
  
  song.tracks.forEach((track, idx) => {
    const baseColor = hexToRgba(track.color || '#60a5fa', idx === activeTrack ? 1 : 0.3);
    
    // Enhanced viewport culling with buffer for large files
    const visibleNotes = track.clips[0].notes.filter(n => 
      n.tick + n.dur >= renderStartTick && n.tick <= renderEndTick && 
      n.midi >= bottomMidi && n.midi <= topMidi
    );
    
    // Limit number of notes rendered for very large files
    const maxNotesPerTrack = 10000; // Prevent browser from hanging
    const notesToRender = visibleNotes.length > maxNotesPerTrack ? 
      visibleNotes.slice(0, maxNotesPerTrack) : visibleNotes;
    
    // Show warning for large files
    if (visibleNotes.length > maxNotesPerTrack) {
      seqStatus.textContent = `⚠️ Large file: Showing ${notesToRender.length}/${visibleNotes.length} notes in viewport`;
    }
    
    notesToRender.forEach(n => {
      const x = n.tick / SIXTEENTH * cellW - scrollLeft;
      const w = n.dur / SIXTEENTH * cellW;
      const y = (MAX_MIDI - n.midi - 1) * cellH;
      
      // Piano-style coloring: black keys (sharps) vs white keys (naturals)
      const pc = n.midi % 12;
      const isBlackKey = [1, 3, 6, 8, 10].includes(pc); // C#, D#, F#, G#, A#
      const pianoColor = isBlackKey ? '#1f2937' : '#f9fafb'; // Dark gray for sharps, light for naturals
      const borderColor = isBlackKey ? '#374151' : '#d1d5db';
      
      // Highlight selected notes
      if (idx === activeTrack && selectedNotes.has(n)) {
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(x - 2, y - 2, w + 4, cellH + 4);
      }
      
      // Draw note with complete coloring
      ctx.fillStyle = pianoColor;
      ctx.fillRect(x, y, w, cellH);
      
      // Add border to distinguish notes
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, cellH);
      
      // Add track color overlay for active track notes (more prominent)
      if (idx === activeTrack) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(x + 1, y + 1, w - 2, cellH - 2);
        
        // Redraw the note color on top with transparency
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = pianoColor;
        ctx.fillRect(x + 1, y + 1, w - 2, cellH - 2);
        ctx.globalAlpha = 1.0;
      }
    });
  });
  
  if (dragNote) {
    const pc = dragNote.midi % 12;
    const isBlackKey = [1, 3, 6, 8, 10].includes(pc);
    ctx.fillStyle = isBlackKey ? 'rgba(31,41,55,0.8)' : 'rgba(249,250,251,0.8)';
    const x = dragNote.tick / SIXTEENTH * cellW - scrollLeft; 
    const w = dragNote.dur / SIXTEENTH * cellW; 
    const y = (MAX_MIDI - dragNote.midi - 1) * cellH; 
    if (x + w >= 0 && x <= width) {
      ctx.fillRect(x, y, w, cellH);
      // Add pink border for drag preview
      ctx.strokeStyle = 'rgba(236,72,153,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, cellH);
    }
  }
  
  // Selection rectangle
  if (ui.selecting) {
    ctx.strokeStyle = '#ff6b9d';
    ctx.fillStyle = 'rgba(255, 107, 157, 0.1)';
    ctx.lineWidth = 2;
    const rectX = Math.min(ui.selectStart.x, ui.selectEnd.x) - scrollLeft;
    const rectY = Math.min(ui.selectStart.y, ui.selectEnd.y);
    const rectW = Math.abs(ui.selectEnd.x - ui.selectStart.x);
    const rectH = Math.abs(ui.selectEnd.y - ui.selectStart.y);
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
  }
  
  // Gutter
  const gctx = pianoRollGutter.getContext('2d');
  pianoRollGutter.width = 60 * dpr; 
  pianoRollGutter.height = height * dpr; 
  pianoRollGutter.style.width = '60px'; 
  pianoRollGutter.style.height = height + 'px';
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0); 
  gctx.clearRect(0, 0, 60, height);
  
  for (let i = 0; i < noteCount; i++) { 
    const y = i * cellH; 
    gctx.fillStyle = i % 2 ? '#243341' : '#23303c'; 
    gctx.fillRect(0, y, 60, cellH); 
    gctx.fillStyle = '#cbd5e1'; 
    const m = MAX_MIDI - 1 - i; 
    gctx.fillText(midiName(m), 5, y + 12); 
  }
  
  // Draw velocity chart
  drawVelocityChart();
}

// Enhanced scheduling with better error handling
function scheduleSongEnhanced() {
  const anySolo = song.tracks.some(t => t.solo);
  
  song.tracks.forEach(track => {
    const active = anySolo ? track.solo : !track.mute;
    if (!active) {
      if (track.player) {
        try {
          track.player.dispose();
        } catch (e) {
          console.warn('Error disposing track player:', e);
        }
      }
      track.player = null;
      return;
    }
    
    if (!track.player) {
      try {
        const drumFactory = DRUMS[track.instrument];
        track.player = drumFactory ? drumFactory() : createSeqInstrument(track.instrument);
        
        if (track.player && track.player.setVolume) {
          track.player.setVolume(track.volume ?? 0.8);
        }
        if (track.player && track.player.setPan) {
          track.player.setPan(track.pan ?? 0);
        }
      } catch (err) {
        console.error(`Failed to create player for ${track.instrument}:`, err);
        // Fallback to piano
        try {
          track.player = createSeqInstrument('Piano');
          if (track.player && track.player.setVolume) {
            track.player.setVolume(track.volume ?? 0.8);
          }
          if (track.player && track.player.setPan) {
            track.player.setPan(track.pan ?? 0);
          }
        } catch (fallbackErr) {
          console.error('Even fallback instrument failed:', fallbackErr);
          track.player = null;
        }
      }
    }
  });

  // Determine song length and dynamic scheduling window
  const ticksPerBeat = song.ppq * (4 / song.ts.den);
  const ticksPerBar = ticksPerBeat * song.ts.num;
  songEndTick = Math.max(0, ...song.tracks.flatMap(t =>
    t.clips.flatMap(c => c.notes.map(n => c.start + n.tick + n.dur))
  ));
  const totalBars = Math.ceil(songEndTick / ticksPerBar) || 1;
  scheduleAheadBars = Math.min(MAX_SCHEDULE_AHEAD_BARS, Math.max(16, Math.ceil(totalBars * 0.25)));

  try {
    Tone.Transport.cancel();
    scheduledUntil = Tone.Transport.ticks;
    scheduleAhead();
    if (rescheduleId !== null) {
      try {
        Tone.Transport.clear(rescheduleId);
      } catch (e) {
        console.warn('Error clearing reschedule:', e);
      }
    }
    rescheduleId = Tone.Transport.scheduleRepeat(scheduleAhead, '1m');
  } catch (e) {
    console.error('Error in scheduleSong:', e);
  }
}

// Enhanced schedule ahead with error handling
function scheduleAheadEnhanced() {
  try {
    const anySolo = song.tracks.some(t => t.solo);
    const ticksPerBeat = song.ppq * (4 / song.ts.den);
    const ticksPerBar = ticksPerBeat * song.ts.num;
    const endTick = Math.min(songEndTick, Tone.Transport.ticks + ticksPerBar * scheduleAheadBars);
    
    song.tracks.forEach(track => {
      const active = anySolo ? track.solo : !track.mute;
      if (!active || !track.player) return;
      
      track.clips.forEach(clip => {
        clip.notes.forEach(n => {
          let when = clip.start + n.tick;
          if (song.loop.enabled) {
            if (when < song.loop.start || when >= song.loop.end) return;
          }
          if (when >= scheduledUntil && when < endTick) {
            try {
              Tone.Transport.schedule(time => {
                try {
                  if (track.player && track.player.trigger) {
                    track.player.trigger(n.midi, time, n.vel ?? 0.8, `${n.dur}i`);
                  }
                } catch (triggerErr) {
                  console.warn('Error triggering note:', triggerErr);
                }
              }, `${when}i`);
            } catch (scheduleErr) {
              console.warn('Error scheduling note:', scheduleErr);
            }
          }
        });
      });
    });
    
    scheduledUntil = endTick;
    if (rescheduleId !== null && scheduledUntil >= songEndTick) {
      try {
        Tone.Transport.clear(rescheduleId);
        rescheduleId = null;
      } catch (e) {
        console.warn('Error clearing reschedule at end:', e);
      }
    }
  } catch (e) {
    console.error('Error in scheduleAhead:', e);
  }
}

// Export the enhanced functions
window.SequencerEngine = {
  createSeqInstrument,
  drawPianoRollEnhanced,
  scheduleSongEnhanced,
  scheduleAheadEnhanced,
  makeSynth,
  SEQ_INSTR
};
