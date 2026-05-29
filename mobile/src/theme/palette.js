// Volconok palette — pencil sketch monochrome design system.
// Multiple shades of gray to mimic pencil drawing with varying pressure.

export const light = {
  name: 'light',
  // Paper tones
  bg: '#F8F6F1',           // aged paper
  paper: '#FEFDFB',        // clean paper
  surface: '#F3F1EC',      // slightly used paper
  surfaceAlt: '#EBE9E3',   // well-used paper
  
  // Ink/Pencil tones (varying pressure)
  ink: '#1A1A1A',          // heavy pencil pressure
  inkSoft: '#3D3D3D',      // medium-heavy
  inkMuted: '#6B6862',     // medium
  inkFaint: '#A8A49C',     // light sketch
  inkGhost: '#D1CEC6',     // very light, like erased pencil
  
  // Lines
  line: '#2A2A2A',         // strong border
  lineSoft: '#D8D5CD',     // subtle border
  lineSketch: '#C5C2BA',   // sketch line
  
  // Accents
  accent: '#1A1A1A',
  accentInk: '#FEFDFB',
  accentSoft: '#4A4A4A',   // softer accent
  
  // Semantic
  danger: '#8B4049',       // darker, muted red (like aged ink)
  dangerMuted: '#F5E8E9',  // very light danger background
  success: '#3D5A4A',      // muted green
  successMuted: '#E8F0EB', // very light success background
  warning: '#8B7355',      // sepia tone
  warningMuted: '#F5F0E8', // very light warning background
  
  // Chat bubbles
  bubbleMe: '#1A1A1A',
  bubbleMeInk: '#FEFDFB',
  bubbleOther: '#FEFDFB',
  bubbleOtherInk: '#1A1A1A',
  
  // Special
  shadow: '#1A1A1A',
  highlight: '#FFF9E6',    // subtle yellow highlight like old paper
  scribble: '#2A2A2A',     // for decorative scribbles
  eraser: '#F8F6F1',       // eraser marks
};

export const dark = {
  name: 'dark',
  // Paper tones (inverted - like drawing on dark paper)
  bg: '#0D0D0D',
  paper: '#161616',
  surface: '#1E1E1E',
  surfaceAlt: '#262626',
  
  // Ink/Pencil tones (white pencil on dark paper)
  ink: '#EDEBE6',
  inkSoft: '#CDCBC6',
  inkMuted: '#9A958C',
  inkFaint: '#5C574F',
  inkGhost: '#3A3835',
  
  // Lines
  line: '#444444',
  lineSoft: '#2E2E2E',
  lineSketch: '#383838',
  
  // Accents
  accent: '#EDEBE6',
  accentInk: '#0D0D0D',
  accentSoft: '#B0AEA8',
  
  // Semantic
  danger: '#D4686A',
  dangerMuted: '#2A1A1B',  // dark danger background
  success: '#6B9B7A',
  successMuted: '#1A2A1E', // dark success background
  warning: '#C9A86C',
  warningMuted: '#2A2518', // dark warning background
  
  // Chat bubbles
  bubbleMe: '#EDEBE6',
  bubbleMeInk: '#0D0D0D',
  bubbleOther: '#1E1E1E',
  bubbleOtherInk: '#EDEBE6',
  
  // Special
  shadow: '#000000',
  highlight: '#2A2820',
  scribble: '#EDEBE6',
  eraser: '#0D0D0D',
};

export const palettes = { light, dark };
