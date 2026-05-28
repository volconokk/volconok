import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { PencilFrame } from './PencilFrame';
import { useTheme } from '../theme/ThemeProvider';

export function PencilInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  autoCorrect = false,
  multiline,
  numberOfLines,
  leftIcon,
  style,
  ...rest
}) {
  const { colors, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={style}>
      {label ? (
        <Text
          style={{
            ...typography.caption,
            color: colors.inkMuted,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      ) : null}
      <PencilFrame
        filled
        fillColor={colors.paper}
        color={focused ? colors.ink : colors.lineSoft}
        radius={16}
        padding={0}
        strokeWidth={focused ? 1.8 : 1.2}
        jitter={focused ? 2 : 1.2}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftIcon ? <View style={{ paddingLeft: 14 }}>{leftIcon}</View> : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.inkFaint}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              paddingHorizontal: leftIcon ? 10 : 16,
              paddingVertical: multiline ? 14 : 12,
              fontSize: 16,
              color: colors.ink,
              minHeight: multiline ? 96 : 48,
              textAlignVertical: multiline ? 'top' : 'center',
            }}
            {...rest}
          />
        </View>
      </PencilFrame>
    </View>
  );
}
