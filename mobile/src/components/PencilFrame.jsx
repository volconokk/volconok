import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

export function PencilFrame({
  children,
  style,
  radius = 18,
  strokeWidth = 1.4,
  filled = false,
  jitter = 1.6,
  color,
  fillColor,
  padding = 12,
}) {
  const { colors } = useTheme();
  const stroke = color || colors.line;
  const fill = filled ? fillColor || colors.paper : 'transparent';

  const [size, setSize] = React.useState({ w: 0, h: 0 });

  const path = useMemo(() => {
    const { w, h } = size;
    if (w < 4 || h < 4) return '';
    const r = Math.min(radius, w / 2, h / 2);
    const jx = (n) => n + (Math.random() - 0.5) * jitter;
    const jy = (n) => n + (Math.random() - 0.5) * jitter;
    return [
      `M ${jx(r)} ${jy(0)}`,
      `L ${jx(w - r)} ${jy(0)}`,
      `Q ${jx(w)} ${jy(0)} ${jx(w)} ${jy(r)}`,
      `L ${jx(w)} ${jy(h - r)}`,
      `Q ${jx(w)} ${jy(h)} ${jx(w - r)} ${jy(h)}`,
      `L ${jx(r)} ${jy(h)}`,
      `Q ${jx(0)} ${jy(h)} ${jx(0)} ${jy(h - r)}`,
      `L ${jx(0)} ${jy(r)}`,
      `Q ${jx(0)} ${jy(0)} ${jx(r)} ${jy(0)}`,
      'Z',
    ].join(' ');
  }, [size.w, size.h, radius, jitter]);

  return (
    <View
      style={[{ padding, position: 'relative' }, style]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <Svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', left: 0, top: 0 }}
        pointerEvents="none"
      >
        {path ? (
          <>
            <Path
              d={path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            <Path
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.55}
            />
          </>
        ) : null}
      </Svg>
      {children}
    </View>
  );
}
