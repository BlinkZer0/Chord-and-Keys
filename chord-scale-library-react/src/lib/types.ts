export interface Note {
  name: string;
  midi: number;
  frequency: number;
  isBlack: boolean;
  octave: number;
}

export interface Scale {
  name: string;
  pattern: number[];
  category: 'Western' | 'Maqam';
}

export interface Chord {
  name: string;
  pattern: number[];
  quality: string;
}

export interface Instrument {
  name: string;
  type: 'string' | 'wind' | 'percussion' | 'keyboard';
  tuning?: string[];
  icon?: string;
}

export interface Theme {
  name: string;
  background: string;
  text: string;
  className: string;
}

export interface PianoKey {
  note: string;
  midi: number;
  isBlack: boolean;
  octave: number;
  x: number;
  width: number;
}

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}
