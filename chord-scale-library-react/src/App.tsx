import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Piano from './components/Piano';
import Tabs from './components/Tabs';
import Dropdown from './components/Dropdown';
import type { Tab, DropdownOption, Theme } from './lib/types';

// Import theory modules
import { KEYS } from './lib/theory/notes.js';
import { MODES, buildScale } from './lib/theory/scales.js';
import { CHORD_QUALITIES, buildChord } from './lib/theory/chords.js';

const App: React.FC = () => {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedMode, setSelectedMode] = useState<string>('Ionian');
  const [selectedChord, setSelectedChord] = useState<string>('Maj');
  const [currentTheme, setCurrentTheme] = useState<string>('skin-default');
  const [activeTab, setActiveTab] = useState<string>('scales');

  // Themes
  const themes: Theme[] = [
    { name: 'Default', background: '#020617', text: '#f1f5f9', className: 'skin-default' },
    { name: 'Solarized', background: '#002b36', text: '#eee8d5', className: 'skin-solarized' },
    { name: 'Mono', background: '#000000', text: '#ffffff', className: 'skin-mono' },
    { name: 'Spring', background: 'linear-gradient(180deg, #d4fc79 0%, #96e6a1 100%)', text: '#064e3b', className: 'skin-spring' },
    { name: 'Summer', background: 'linear-gradient(180deg, #fceabb 0%, #f8b500 100%)', text: '#78350f', className: 'skin-summer' },
    { name: 'Autumn', background: 'linear-gradient(180deg, #f6d365 0%, #fda085 100%)', text: '#7c2d12', className: 'skin-autumn' },
    { name: 'Winter', background: 'linear-gradient(180deg, #e0eafc 0%, #cfdef3 100%)', text: '#1e3a8a', className: 'skin-winter' },
    { name: 'Forest', background: 'radial-gradient(circle at center, #2e8b57 0%, #006400 100%)', text: '#f0fff0', className: 'skin-forest' },
    { name: 'Ocean', background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 100%)', text: '#e0f7fa', className: 'skin-ocean' },
    { name: 'Desert', background: 'linear-gradient(180deg, #eacda3 0%, #d6ae7b 100%)', text: '#654321', className: 'skin-desert' },
    { name: 'Mountain', background: 'linear-gradient(180deg, #bdc3c7 0%, #2c3e50 100%)', text: '#1f2937', className: 'skin-mountain' },
    { name: 'Sunrise', background: 'radial-gradient(circle at center, #ff5f6d 0%, #ffc371 100%)', text: '#7c2d12', className: 'skin-sunrise' },
    { name: 'Sunset', background: 'linear-gradient(180deg, #0b486b 0%, #f56217 100%)', text: '#fef3c7', className: 'skin-sunset' }
  ];

  // Dropdown options
  const keyOptions: DropdownOption[] = KEYS.map((key: string) => ({
    value: key,
    label: key
  }));

  const modeOptions: DropdownOption[] = Object.keys(MODES).map(mode => ({
    value: mode,
    label: mode
  }));

  const chordOptions: DropdownOption[] = Object.keys(CHORD_QUALITIES).map(chord => ({
    value: chord,
    label: chord
  }));

  const themeOptions: DropdownOption[] = themes.map(theme => ({
    value: theme.className,
    label: theme.name
  }));

  // Handle note selection
  const handleNoteClick = (note: string) => {
    setSelectedNotes(prev => {
      if (prev.includes(note)) {
        return prev.filter(n => n !== note);
      } else {
        return [...prev, note];
      }
    });
  };

  // Generate scale notes
  const scaleNotes = buildScale(selectedKey, selectedMode);
  
  // Generate chord notes
  const chordNotes = buildChord(selectedKey, selectedChord);

  // Update selected notes when scale/chord changes
  useEffect(() => {
    if (activeTab === 'scales') {
      setSelectedNotes(scaleNotes);
    } else if (activeTab === 'chords') {
      setSelectedNotes(chordNotes);
    }
  }, [selectedKey, selectedMode, selectedChord, activeTab]);

  // Apply theme
  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);

  // Tab content
  const tabs: Tab[] = [
    {
      id: 'scales',
      label: '🎵 Scales & Modes',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <Dropdown
                options={keyOptions}
                value={selectedKey}
                onValueChange={setSelectedKey}
                placeholder="Select key..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <Dropdown
                options={modeOptions}
                value={selectedMode}
                onValueChange={setSelectedMode}
                placeholder="Select mode..."
              />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              {selectedKey} {selectedMode}
            </h3>
            <p className="text-gray-300 mb-4">
              Notes: {scaleNotes.join(' - ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {scaleNotes.map(note => (
                <span
                  key={note}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'chords',
      label: '🎸 Chords',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Root Note</label>
              <Dropdown
                options={keyOptions}
                value={selectedKey}
                onValueChange={setSelectedKey}
                placeholder="Select root..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Chord Quality</label>
              <Dropdown
                options={chordOptions}
                value={selectedChord}
                onValueChange={setSelectedChord}
                placeholder="Select chord..."
              />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              {selectedKey} {selectedChord}
            </h3>
            <p className="text-gray-300 mb-4">
              Notes: {chordNotes.join(' - ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {chordNotes.map(note => (
                <span
                  key={note}
                  className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'piano',
      label: '🎹 Interactive Piano',
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Play the Piano</h3>
            <p className="text-gray-300 mb-4">
              Click on keys or use your keyboard (A-J for white keys, W-U for black keys)
            </p>
            <Piano
              selectedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
            />
          </div>
          
          {selectedNotes.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Selected Notes:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedNotes.map(note => (
                  <span
                    key={note}
                    className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Chord & Scale Library
          </h1>
          <p className="text-gray-400">
            Your interactive music theory playground
          </p>
        </motion.div>

        {/* Theme Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Theme</label>
          <Dropdown
            options={themeOptions}
            value={currentTheme}
            onValueChange={setCurrentTheme}
            placeholder="Select theme..."
            className="w-full md:w-64"
          />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs
            tabs={tabs}
            defaultValue={activeTab}
            onValueChange={setActiveTab}
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>Built with React, TypeScript, and Tone.js</p>
          <p className="mt-1">🎵 Making music theory accessible to everyone 🎵</p>
        </motion.div>
      </div>
    </div>
  );
};

export default App;
