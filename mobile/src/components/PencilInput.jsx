import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          borderRadius: 14,
          borderWidth: focused ? 1.6 : 1.2,
          borderColor: focused ? colors.ink : colors.lineSoft,
          backgroundColor: colors.paper,
        }}
      >
        {leftIcon ? (
          <View style={{ paddingLeft: 14, paddingTop: multiline ? 14 : 0 }}>{leftIcon}</View>
        ) : null}
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
    </View>
  );
}
