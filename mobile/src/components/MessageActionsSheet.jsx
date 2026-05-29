import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeProvider';
import { REACTION_EMOJI } from './MessageBubble';
import { ReplyIcon, CopyIcon, EditIcon, TrashIcon } from './icons';

const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'fire'];

export function MessageActionsSheet({ visible, message, onClose, onReact, onReply, onCopy, onEdit, onDelete }) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slide, { toValue: 1, useNativeDriver: true, friction: 9, tension: 70 }).start();
    } else {
      slide.setValue(0);
    }
  }, [visible, slide]);

  if (!message) return null;

  const myReaction = (message.reactions || []).find((r) => r.mine)?.type;

  const actions = [
    { key: 'reply', label: t('messages.reply'), icon: ReplyIcon, onPress: onReply },
    ...(message.text ? [{ key: 'copy', label: t('messages.copy'), icon: CopyIcon, onPress: onCopy }] : []),
    ...(message.outgoing && message.text
      ? [{ key: 'edit', label: t('messages.edit'), icon: EditIcon, onPress: onEdit }]
      : []),
    ...(message.outgoing
      ? [{ key: 'delete', label: t('messages.deleteMessage'), icon: TrashIcon, onPress: onDelete, danger: true }]
      : []),
  ];

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bg,
              paddingBottom: insets.bottom + 12,
              transform: [{ translateY }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Reaction picker row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: colors.paper,
                borderRadius: 24,
                paddingVertical: 10,
                paddingHorizontal: 8,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.lineSoft,
              }}
            >
              {REACTION_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => onReact?.(type)}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 1.3 : myReaction === type ? 1.15 : 1 }],
                    backgroundColor: myReaction === type ? colors.surface : 'transparent',
                    borderRadius: 18,
                    padding: 6,
                  })}
                >
                  <Text style={{ fontSize: 26 }}>{REACTION_EMOJI[type]}</Text>
                </Pressable>
              ))}
            </View>

            {/* Action list */}
            <View
              style={{
                backgroundColor: colors.paper,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.lineSoft,
                overflow: 'hidden',
              }}
            >
              {actions.map((action, idx) => {
                const Icon = action.icon;
                const color = action.danger ? colors.danger : colors.ink;
                return (
                  <Pressable
                    key={action.key}
                    onPress={action.onPress}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      backgroundColor: pressed ? colors.surface : 'transparent',
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: colors.lineSoft,
                    })}
                  >
                    <Icon size={20} color={color} />
                    <Text style={{ ...typography.body, color, marginLeft: 14 }}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 14,
    paddingTop: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
