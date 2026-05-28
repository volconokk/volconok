import React from 'react';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

// Apple-style thin-line, transparent icons. All icons share a 24x24 viewbox.
const base = (size, color) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

function useIconColor(c) {
  const { colors } = useTheme();
  return c || colors.ink;
}

export const HomeIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M3 11.5 12 4l9 7.5" />
      <Path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </Svg>
  );
};

export const FriendsIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="9" cy="8.5" r="3.2" />
      <Path d="M2.8 19.5c.6-3 3.2-4.5 6.2-4.5s5.6 1.5 6.2 4.5" />
      <Circle cx="17" cy="9" r="2.4" />
      <Path d="M15.5 14.6c2.5-.4 5 1 5.5 4.4" />
    </Svg>
  );
};

export const ChatIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5h11c1.4 0 2.5 1.1 2.5 2.5v8c0 1.4-1.1 2.5-2.5 2.5H10l-4 3.5V17H6.5C5.1 17 4 15.9 4 14.5z" />
    </Svg>
  );
};

export const ProfileIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="8" r="3.6" />
      <Path d="M4.5 20c.8-3.6 4-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
    </Svg>
  );
};

export const BellIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M6 16c0-3 .8-7 6-7s6 4 6 7l1.2 1.5H4.8z" />
      <Path d="M10 19.5c.3 1 1 1.7 2 1.7s1.7-.7 2-1.7" />
    </Svg>
  );
};

export const HeartIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </Svg>
  );
};

export const CommentIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </Svg>
  );
};

export const PlusIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} strokeWidth={2}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
};

export const ImageIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <Circle cx="9" cy="10" r="1.6" />
      <Polyline points="4,17 9,12 13,16 17,12 20,15" />
    </Svg>
  );
};

export const SendIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 12 20 4l-3 16-4-7z" />
      <Line x1="4" y1="12" x2="13" y2="13" />
    </Svg>
  );
};

export const SearchIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="11" cy="11" r="6.5" />
      <Line x1="16" y1="16" x2="20" y2="20" />
    </Svg>
  );
};

export const SettingsIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.8a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.5a7 7 0 0 0-2.1 1.2l-2.4-.8-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.8a7 7 0 0 0 2.1 1.2L10 21h4l.4-2.5a7 7 0 0 0 2.1-1.2l2.4.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
    </Svg>
  );
};

export const BackIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Polyline points="14,6 8,12 14,18" />
    </Svg>
  );
};

export const CheckIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Polyline points="5,12 10,17 19,7" />
    </Svg>
  );
};

export const XIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  );
};

export const LogoutIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <Polyline points="14,7 19,12 14,17" />
      <Line x1="19" y1="12" x2="9" y2="12" />
    </Svg>
  );
};

export const MoonIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </Svg>
  );
};

export const SunIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="4" />
      <Line x1="12" y1="2" x2="12" y2="5" />
      <Line x1="12" y1="19" x2="12" y2="22" />
      <Line x1="2" y1="12" x2="5" y2="12" />
      <Line x1="19" y1="12" x2="22" y2="12" />
      <Line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
      <Line x1="17.5" y1="17.5" x2="19.5" y2="19.5" />
      <Line x1="4.5" y1="19.5" x2="6.5" y2="17.5" />
      <Line x1="17.5" y1="6.5" x2="19.5" y2="4.5" />
    </Svg>
  );
};

export const GlobeIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="3" y1="12" x2="21" y2="12" />
      <Path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </Svg>
  );
};

export const TrashIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Polyline points="4,7 20,7" />
      <Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <Path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </Svg>
  );
};

export const PencilIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 20l4-1 11-11-3-3L5 16z" />
      <Line x1="14" y1="6" x2="18" y2="10" />
    </Svg>
  );
};
