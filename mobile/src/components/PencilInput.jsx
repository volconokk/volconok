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
  rightIcon,
  maxLength,
  showCounter,
  error,
  style,
  inputStyle,
  ...rest
}) {
  const { colors, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.ink
      : colors.lineSoft;

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
          borderWidth: focused || error ? 1.6 : 1.2,
          borderColor,
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
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            paddingHorizontal: leftIcon ? 10 : 16,
            paddingVertical: multiline ? 12 : 12,
            fontSize: 16,
            color: colors.ink,
            minHeight: multiline ? 44 : 48,
            maxHeight: multiline ? 120 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
            ...inputStyle,
          }}
          {...rest}
        />
        {rightIcon ? (
          <View style={{ paddingRight: 12, paddingTop: multiline ? 12 : 0 }}>{rightIcon}</View>
        ) : null}
      </View>
      {error || (showCounter && maxLength) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          {error ? (
            <Text style={{ ...typography.caption, color: colors.danger, flex: 1 }}>{error}</Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {showCounter && maxLength ? (
            <Text style={{ ...typography.caption, color: colors.inkFaint }}>
              {(value || '').length}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
