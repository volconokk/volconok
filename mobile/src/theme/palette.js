// Volconok palette — a clean, modern monochrome (black & white) system.
// Designed to render consistently across iOS and Android using native styling.

export const light = {
  name: 'light',
  bg: '#FAF9F6', // soft paper white
  paper: '#FFFFFF',
  surface: '#F2F0EB',
  surfaceAlt: '#ECEAE4',
  ink: '#111111',
  inkSoft: '#333333',
  inkMuted: '#6B6862',
  inkFaint: '#A8A49C',
  line: '#1A1A1A',
  lineSoft: '#DAD7D0',
  accent: '#111111',
  accentInk: '#FFFFFF',
  danger: '#B85450',
  success: '#2D6A4F',
  bubbleMe: '#111111',
  bubbleMeInk: '#FFFFFF',
  bubbleOther: '#FFFFFF',
  bubbleOtherInk: '#111111',
  shadow: '#000000',
};

export const dark = {
  name: 'dark',
  bg: '#0B0B0B',
  paper: '#171717',
  surface: '#1F1F1F',
  surfaceAlt: '#262626',
  ink: '#F5F3EE',
  inkSoft: '#DAD7D0',
  inkMuted: '#9A958C',
  inkFaint: '#5C574F',
  line: '#3A3A3A',
  lineSoft: '#2C2C2C',
  accent: '#F5F3EE',
  accentInk: '#0B0B0B',
  danger: '#E85D52',
  success: '#52B788',
  bubbleMe: '#F5F3EE',
  bubbleMeInk: '#0B0B0B',
  bubbleOther: '#1F1F1F',
  bubbleOtherInk: '#F5F3EE',
  shadow: '#000000',
};

export const palettes = { light, dark };
