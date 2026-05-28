// Volconok palette — strictly black-and-white with subtle paper-like shades.
// Pencil sketch effect is built on these tones plus the noise/hatch SVG overlays.

export const light = {
  name: 'light',
  bg: '#F7F5F0', // warm paper
  paper: '#FFFFFF',
  surface: '#F1ECE2',
  ink: '#0D0D0D',
  inkSoft: '#2B2B2B',
  inkMuted: '#6E6A63',
  inkFaint: '#A6A199',
  line: '#0D0D0D',
  lineSoft: '#B7B2AA',
  accent: '#0D0D0D',
  accentInk: '#FFFFFF',
  danger: '#1A1A1A',
  bubbleMe: '#0D0D0D',
  bubbleMeInk: '#F7F5F0',
  bubbleOther: '#FFFFFF',
  bubbleOtherInk: '#0D0D0D',
  shadow: 'rgba(13,13,13,0.18)',
  overlay: 'rgba(13,13,13,0.55)',
};

export const dark = {
  name: 'dark',
  bg: '#0E0E0E',
  paper: '#161616',
  surface: '#1C1C1C',
  ink: '#F4F1EA',
  inkSoft: '#D8D4CB',
  inkMuted: '#9B968D',
  inkFaint: '#5A554D',
  line: '#F4F1EA',
  lineSoft: '#3A3833',
  accent: '#F4F1EA',
  accentInk: '#0E0E0E',
  danger: '#F4F1EA',
  bubbleMe: '#F4F1EA',
  bubbleMeInk: '#0E0E0E',
  bubbleOther: '#1C1C1C',
  bubbleOtherInk: '#F4F1EA',
  shadow: 'rgba(0,0,0,0.55)',
  overlay: 'rgba(0,0,0,0.65)',
};

export const palettes = { light, dark };
