// Loader for Surge XT Web AudioWorklet
// Fetches remote worklet and WASM and exposes factory methods
(function(){
  const SURGE_BASE_URL = 'https://surge-synthesizer.github.io/websurge/';
  const WORKLET_URL = SURGE_BASE_URL + 'SurgeXTAudioWorkletProcessor.js';
  const WASM_URL = SURGE_BASE_URL + 'SurgeXTAudioWorkletProcessor.wasm';

  let context; // AudioContext provided by Tone.js
  let node;    // shared AudioWorkletNode instance
  let initPromise;

  async function init(ac){
    context = ac;
    if(initPromise) return initPromise;
    initPromise = (async()=>{
      await ac.audioWorklet.addModule(WORKLET_URL);
      const wasmBinary = await fetch(WASM_URL).then(r=>r.arrayBuffer());
      node = new AudioWorkletNode(ac, 'SurgeXTAudioWorkletProcessor', {
        numberOfInputs:0,
        outputChannelCount:[2],
        processorOptions:{ wasmBinary }
      });
      node.connect(ac.destination);
    })();
    return initPromise;
  }

  function createInstrument(presetFile){
    let loaded;
    async function loadPreset(){
      await init(context || new (window.AudioContext||window.webkitAudioContext)());
      if(loaded) return; // already loaded preset
      const url = SURGE_BASE_URL + 'presets/' + presetFile;
      const data = await fetch(url).then(r=>r.arrayBuffer());
      node.port.postMessage({ type:'loadPreset', data }, [data]);
      loaded = true;
    }
    return {
      get loaded(){ return loadPreset(); },
      trigger(midi, time, velocity=0.8, dur=0.5){
        loadPreset().then(()=>{
          node.port.postMessage({ type:'noteOn', midi, time, velocity });
          node.port.postMessage({ type:'noteOff', midi, time: time + dur });
        });
      },
      setVolume(v){
        loadPreset().then(()=>{
          node.parameters.get('gain')?.setValueAtTime(v, context.currentTime);
        });
      },
      setPan(p){
        loadPreset().then(()=>{
          node.parameters.get('pan')?.setValueAtTime(p, context.currentTime);
        });
      },
      dispose(){ node?.disconnect(); }
    };
  }

  window.SurgeLoader = { init, createInstrument };
})();
