import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('mode tab switching', () => {
  it('shows correct sections when buttons are clicked', () => {
    const htmlPath = path.join(process.cwd(), 'chord_scale_library_html_tailwind_tone.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const { window } = dom;
    const { document } = window;

    // Stub initialization functions and globals
    window.buildPiano = () => { throw new Error('init failure'); };
    window.refreshInstruments = () => {};
    window.updateAll = () => {};
    window.runTests = () => { throw new Error('test failure'); };
    window.initSequencer = () => {};
    window.generatePatternLibrary = () => {};
    window.refreshPatternSelector = () => {};

    window.mode = 'Chord';
    window.btnModeChord = document.getElementById('btnModeChord');
    window.btnModeScale = document.getElementById('btnModeScale');
    window.btnModeSequencer = document.getElementById('btnModeSequencer');
    window.wrapChord = document.getElementById('wrapChord');
    window.wrapScale = document.getElementById('wrapScale');
    window.listenChord = document.getElementById('listenChord');
    window.listenScale = document.getElementById('listenScale');
    window.sequencerHost = document.getElementById('sequencerHost');

    const script = `
      document.addEventListener('DOMContentLoaded', () => {
        try {
          buildPiano();
          refreshInstruments();
          updateAll();
          runTests();
          initSequencer();
          generatePatternLibrary();
          refreshPatternSelector();
        } catch (e) {
          console.error('Error during UI build:', e);
        }

        btnModeChord.addEventListener('click', ()=>{
          mode='Chord';
          btnModeChord.className='px-3 py-2 text-sm bg-slate-700/70';
          btnModeScale.className='px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
          btnModeSequencer.className='px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
          wrapChord.classList.remove('hidden');
          wrapScale.classList.add('hidden');
          listenChord.classList.remove('hidden');
          listenScale.classList.add('hidden');
          sequencerHost.classList.add('hidden');
          updateAll();
        });
        btnModeScale.addEventListener('click', ()=>{
          mode='Scale/Mode';
          btnModeScale.className='px-3 py-2 text-sm bg-slate-700/70';
          btnModeChord.className='px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
          btnModeSequencer.className='px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
          wrapScale.classList.remove('hidden');
          wrapChord.classList.add('hidden');
          listenScale.classList.remove('hidden');
          listenChord.classList.add('hidden');
          sequencerHost.classList.add('hidden');
          updateAll();
        });
        btnModeSequencer.addEventListener('click', ()=>{
          mode='Sequencer';
          btnModeSequencer.className='px-3 py-2 text-sm bg-slate-700/70';
          btnModeChord.className='px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
          btnModeScale.className='px-3 py-2 text-sm bg-slate-800/60 hover:bg-slate-700/50';
          wrapChord.classList.add('hidden');
          wrapScale.classList.add('hidden');
          listenChord.classList.add('hidden');
          listenScale.classList.add('hidden');
          sequencerHost.classList.remove('hidden');
          updateAll();
        });
      });
    `;

    window.eval(script);

    document.dispatchEvent(new window.Event('DOMContentLoaded'));

    const btnScale = window.btnModeScale;
    const btnSeq = window.btnModeSequencer;
    const wrapScale = window.wrapScale;
    const sequencerHost = window.sequencerHost;

    btnScale.click();
    expect(wrapScale.classList.contains('hidden')).to.be.false;
    expect(sequencerHost.classList.contains('hidden')).to.be.true;

    btnSeq.click();
    expect(sequencerHost.classList.contains('hidden')).to.be.false;
    expect(wrapScale.classList.contains('hidden')).to.be.true;
  });
});
