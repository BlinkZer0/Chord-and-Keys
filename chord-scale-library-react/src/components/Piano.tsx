import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PianoKey } from '../lib/types';

interface PianoProps {
  selectedNotes: string[];
  onNoteClick: (note: string) => void;
}

const Piano: React.FC<PianoProps> = ({ selectedNotes, onNoteClick }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Generate piano keys (C2 to C6)
  const generateKeys = (): PianoKey[] => {
    const keys: PianoKey[] = [];
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    
    let x = 0;
    for (let octave = 2; octave <= 6; octave++) {
      for (let i = 0; i < whiteKeys.length; i++) {
        const note = whiteKeys[i];
        const fullNote = `${note}${octave}`;
        const midi = 24 + (octave - 2) * 12 + i;
        
        keys.push({
          note: fullNote,
          midi,
          isBlack: false,
          octave,
          x,
          width: 48
        });
        x += 48;
      }
    }
    
    // Add black keys
    x = 36; // Offset for first black key
    for (let octave = 2; octave <= 6; octave++) {
      for (let i = 0; i < blackKeys.length; i++) {
        const note = blackKeys[i];
        const fullNote = `${note}${octave}`;
        const midi = 25 + (octave - 2) * 12 + i;
        
        // Skip black keys that don't exist in this octave
        if (note === 'C#' && i === 0) {
          keys.push({
            note: fullNote,
            midi,
            isBlack: true,
            octave,
            x,
            width: 32
          });
        } else if (note === 'D#' && i === 1) {
          keys.push({
            note: fullNote,
            midi,
            isBlack: true,
            octave,
            x,
            width: 32
          });
        } else if (note === 'F#' && i === 2) {
          keys.push({
            note: fullNote,
            midi,
            isBlack: true,
            octave,
            x,
            width: 32
          });
        } else if (note === 'G#' && i === 3) {
          keys.push({
            note: fullNote,
            midi,
            isBlack: true,
            octave,
            x,
            width: 32
          });
        } else if (note === 'A#' && i === 4) {
          keys.push({
            note: fullNote,
            midi,
            isBlack: true,
            octave,
            x,
            width: 32
          });
        }
        x += 48;
      }
    }
    
    return keys;
  };

  const keys = generateKeys();

  const handleKeyClick = (note: string) => {
    onNoteClick(note);
    
    // Add visual feedback
    setPressedKeys(prev => new Set([...prev, note]));
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 100);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const keyMap: { [key: string]: string } = {
      'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4',
      'w': 'C#4', 'e': 'D#4', 't': 'F#4', 'y': 'G#4', 'u': 'A#4'
    };
    
    const note = keyMap[event.key.toLowerCase()];
    if (note && !pressedKeys.has(note)) {
      handleKeyClick(note);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const keyMap: { [key: string]: string } = {
      'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4',
      'w': 'C#4', 'e': 'D#4', 't': 'F#4', 'y': 'G#4', 'u': 'A#4'
    };
    
    const note = keyMap[event.key.toLowerCase()];
    if (note) {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys]);

  return (
    <div className="piano-container relative bg-gray-800 p-4 rounded-lg">
      <div className="piano-keys relative flex">
        {keys.map((key) => (
          <motion.div
            key={key.note}
            className={`piano-key ${key.isBlack ? 'black' : 'white'} ${
              selectedNotes.includes(key.note) ? 'selected' : ''
            } ${pressedKeys.has(key.note) ? 'pressed' : ''}`}
            style={{
              left: key.isBlack ? `${key.x}px` : 'auto',
              width: `${key.width}px`,
              height: key.isBlack ? '80px' : '128px',
              top: key.isBlack ? '0' : 'auto'
            }}
            onClick={() => handleKeyClick(key.note)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
              {key.note}
            </span>
          </motion.div>
        ))}
      </div>
      
      {/* Particle effects */}
      {pressedKeys.size > 0 && (
        <div className="particle-container absolute inset-0 pointer-events-none">
          {Array.from(pressedKeys).map((note, index) => (
            <motion.div
              key={`${note}-${index}`}
              className="particle w-2 h-2 bg-blue-400"
              initial={{ 
                x: Math.random() * 400, 
                y: 128,
                scale: 1,
                opacity: 1 
              }}
              animate={{ 
                y: -50,
                scale: 0,
                opacity: 0 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Piano;
