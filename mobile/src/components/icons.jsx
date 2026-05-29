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

// === REACTION ICONS (sketch style) ===

export const LoveIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Path d="M12 21C12 21 3 13.5 3 8.5C3 5.5 5.5 3 8.5 3C10 3 11.5 4 12 5C12.5 4 14 3 15.5 3C18.5 3 21 5.5 21 8.5C21 13.5 12 21 12 21Z" />
      <Circle cx="8" cy="8" r="1" fill={c} />
      <Circle cx="16" cy="8" r="1" fill={c} />
    </Svg>
  );
};

export const LaughIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M8 9 Q8.5 8 9 9" />
      <Path d="M15 9 Q15.5 8 16 9" />
      <Path d="M7 14 Q12 19 17 14" />
    </Svg>
  );
};

export const WowIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="8.5" cy="10" r="1.5" />
      <Circle cx="15.5" cy="10" r="1.5" />
      <Circle cx="12" cy="16" r="2.5" />
    </Svg>
  );
};

export const SadIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="8.5" cy="10" r="1" fill={c} />
      <Circle cx="15.5" cy="10" r="1" fill={c} />
      <Path d="M8 17 Q12 14 16 17" />
      <Path d="M7 7 L10 9" />
      <Path d="M17 7 L14 9" />
    </Svg>
  );
};

export const AngryIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="8.5" cy="11" r="1" fill={c} />
      <Circle cx="15.5" cy="11" r="1" fill={c} />
      <Path d="M8 16 Q12 14 16 16" />
      <Path d="M6 8 L10 10" />
      <Path d="M18 8 L14 10" />
    </Svg>
  );
};

// === FEATURE ICONS ===

export const BookmarkIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18l-7-4-7 4V4z" />
    </Svg>
  );
};

export const ShareIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="6" cy="12" r="2.5" />
      <Circle cx="18" cy="6" r="2.5" />
      <Circle cx="18" cy="18" r="2.5" />
      <Line x1="8.5" y1="11" x2="15.5" y2="7" />
      <Line x1="8.5" y1="13" x2="15.5" y2="17" />
    </Svg>
  );
};

export const CameraIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
};

export const MicIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <Path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <Line x1="12" y1="18" x2="12" y2="22" />
      <Line x1="8" y1="22" x2="16" y2="22" />
    </Svg>
  );
};

export const StickerIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <Circle cx="9" cy="10" r="1" fill={c} />
      <Circle cx="15" cy="10" r="1" fill={c} />
    </Svg>
  );
};

export const GifIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <Path d="M8 10h2v4H8v-2h1" />
      <Line x1="12" y1="10" x2="12" y2="14" />
      <Path d="M15 10h3M15 12h2M15 14h1" />
    </Svg>
  );
};

export const LocationIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
      <Circle cx="12" cy="9" r="2.5" />
    </Svg>
  );
};

export const SparkleIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      <Path d="M5 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      <Path d="M18 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    </Svg>
  );
};

export const FireIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Path d="M12 22c4-2 7-6 7-11C19 6 14 2 12 2c0 4-2 6-4 8-2.5 2.5-2 5-2 6 0 4 3 6 6 6z" />
      <Path d="M12 22c-2-1-3-3-3-5 0-2 1-3 3-5 2 2 3 3 3 5 0 2-1 4-3 5z" />
    </Svg>
  );
};

export const CrownIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Path d="M2 17l3-9 5 4 2-8 2 8 5-4 3 9z" />
      <Line x1="2" y1="17" x2="22" y2="17" />
      <Line x1="4" y1="20" x2="20" y2="20" />
    </Svg>
  );
};

export const StarIcon = ({ size = 24, color, filled }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)} fill={filled ? c : 'none'}>
      <Path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
    </Svg>
  );
};

export const EyeIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
};

export const EyeOffIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M17.9 17.4C16.2 18.4 14.2 19 12 19c-7 0-11-8-11-8a21 21 0 0 1 5.1-5.4" />
      <Path d="M14.1 9.9a3 3 0 0 1-4.2 4.2" />
      <Line x1="1" y1="1" x2="23" y2="23" />
      <Path d="M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a21 21 0 0 1-2.2 3.1" />
    </Svg>
  );
};

export const ClockIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="12,6 12,12 16,14" />
    </Svg>
  );
};

export const CalendarIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="4" y1="10" x2="20" y2="10" />
    </Svg>
  );
};

export const LinkIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <Path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </Svg>
  );
};

export const CopyIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <Path d="M8 4v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-4H10a2 2 0 0 0-2 2z" />
    </Svg>
  );
};

export const InfoIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="16" x2="12" y2="12" />
      <Circle cx="12" cy="8" r="0.5" fill={c} />
    </Svg>
  );
};

export const QuoteIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M3 21c3 0 7-1 7-8V5c0-1.3-.8-2-2-2H5a2 2 0 0 0-2 2v6c0 1.3.8 2 2 2h3c0 3-2 5.5-5 6z" />
      <Path d="M14 21c3 0 7-1 7-8V5c0-1.3-.8-2-2-2h-3a2 2 0 0 0-2 2v6c0 1.3.8 2 2 2h3c0 3-2 5.5-5 6z" />
    </Svg>
  );
};

export const HashIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Line x1="4" y1="9" x2="20" y2="9" />
      <Line x1="4" y1="15" x2="20" y2="15" />
      <Line x1="10" y1="3" x2="8" y2="21" />
      <Line x1="16" y1="3" x2="14" y2="21" />
    </Svg>
  );
};

export const AtIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.3" />
    </Svg>
  );
};

export const EditIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
};

export const RefreshIcon = ({ size = 24, color }) => {
  const c = useIconColor(color);
  return (
    <Svg {...base(size, c)}>
      <Path d="M1 4v6h6" />
      <Path d="M23 20v-6h-6" />
      <Path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10M23 14l-4.6 4.4A9 9 0 0 1 3.5 15" />
    </Svg>
  );
};
