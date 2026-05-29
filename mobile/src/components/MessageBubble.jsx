import React, { memo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme/ThemeProvider';
import { formatTime } from '../utils/time';
import { CheckSingleIcon, DoubleCheckIcon } from './icons';

export const REACTION_EMOJI = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  fire: '🔥',
};

function MessageBubbleComponent({
  item,
  myId,
  language,
  colors,
  typography,
  onLongPress,
  onReplyPress,
  onRetry,
}) {
  const outgoing = item.outgoing;
  const isPending = item.pending;
  const isFailed = item.failed;

  const handleLongPress = () => {
    if (item.deleted || isPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onLongPress?.(item);
  };

  const reactionCounts = {};
  (item.reactions || []).forEach((r) => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });
  const reactionEntries = Object.entries(reactionCounts);

  return (
    <View
      style={{
        alignSelf: outgoing ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        marginVertical: 3,
      }}
    >
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={250}
        onPress={isFailed ? () => onRetry?.(item) : undefined}
        style={({ pressed }) => ({ opacity: pressed && !item.deleted ? 0.85 : 1 })}
      >
        <View
          style={{
            backgroundColor: item.deleted
              ? 'transparent'
              : outgoing
                ? colors.bubbleMe
                : colors.bubbleOther,
            borderWidth: item.deleted ? 1 : outgoing ? 0 : 1,
            borderColor: colors.lineSoft,
            borderStyle: item.deleted ? 'dashed' : 'solid',
            borderRadius: 18,
            borderBottomRightRadius: outgoing ? 4 : 18,
            borderBottomLeftRadius: outgoing ? 18 : 4,
            paddingHorizontal: 14,
            paddingVertical: 9,
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {/* Reply preview inside bubble */}
          {item.replyTo ? (
            <Pressable
              onPress={() => onReplyPress?.(item.replyTo)}
              style={{
                borderLeftWidth: 2,
                borderLeftColor: outgoing ? colors.bubbleMeInk : colors.accent,
                paddingLeft: 8,
                marginBottom: 6,
                opacity: 0.85,
              }}
            >
              <Text
                style={{
                  ...typography.caption,
                  fontWeight: '700',
                  color: outgoing ? colors.bubbleMeInk : colors.ink,
                }}
                numberOfLines={1}
              >
                {item.replyTo.outgoing ? '↩︎' : '↩︎'}{' '}
                {item.replyTo.deleted ? '—' : item.replyTo.text}
              </Text>
            </Pressable>
          ) : null}

          {/* Attachment image */}
          {item.attachment && !item.deleted ? (
            <Image
              source={{ uri: item.attachment }}
              style={{
                width: 220,
                height: 220,
                borderRadius: 12,
                marginBottom: item.text ? 6 : 0,
                backgroundColor: colors.surface,
              }}
              resizeMode="cover"
            />
          ) : null}

          {item.deleted ? (
            <Text
              style={{
                ...typography.body,
                fontStyle: 'italic',
                color: colors.inkFaint,
              }}
            >
              {language === 'ru'
                ? 'Сообщение удалено'
                : language === 'ro'
                  ? 'Mesaj șters'
                  : 'Message deleted'}
            </Text>
          ) : item.text ? (
            <Text
              style={{
                ...typography.body,
                color: outgoing ? colors.bubbleMeInk : colors.bubbleOtherInk,
              }}
            >
              {item.text}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {/* Reactions row */}
      {reactionEntries.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignSelf: outgoing ? 'flex-end' : 'flex-start',
            marginTop: 3,
            gap: 4,
          }}
        >
          {reactionEntries.map(([type, count]) => (
            <View
              key={type}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: colors.lineSoft,
              }}
            >
              <Text style={{ fontSize: 12 }}>{REACTION_EMOJI[type]}</Text>
              {count > 1 ? (
                <Text style={{ ...typography.caption, fontSize: 11, color: colors.inkMuted, marginLeft: 2 }}>
                  {count}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* Meta row: time + status */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: outgoing ? 'flex-end' : 'flex-start',
          marginTop: 2,
          marginHorizontal: 4,
          gap: 4,
        }}
      >
        {item.edited && !item.deleted ? (
          <Text style={{ ...typography.caption, fontSize: 10, color: colors.inkFaint, fontStyle: 'italic' }}>
            {language === 'ru' ? 'изменено' : language === 'ro' ? 'editat' : 'edited'}
          </Text>
        ) : null}
        <Text style={{ ...typography.caption, fontSize: 11, color: colors.inkFaint }}>
          {formatTime(item.createdAt, language)}
        </Text>
        {outgoing && !item.deleted ? (
          isFailed ? (
            <Text style={{ fontSize: 11, color: colors.danger }}>!</Text>
          ) : isPending ? (
            <Text style={{ fontSize: 11, color: colors.inkFaint }}>◷</Text>
          ) : item.readAt ? (
            <DoubleCheckIcon size={14} color={colors.success} />
          ) : (
            <CheckSingleIcon size={14} color={colors.inkFaint} />
          )
        ) : null}
      </View>
    </View>
  );
}

export const MessageBubble = memo(MessageBubbleComponent, (prev, next) => {
  const a = prev.item;
  const b = next.item;
  return (
    a.id === b.id &&
    a.text === b.text &&
    a.readAt === b.readAt &&
    a.deleted === b.deleted &&
    a.edited === b.edited &&
    a.pending === b.pending &&
    a.failed === b.failed &&
    a.attachment === b.attachment &&
    JSON.stringify(a.reactions) === JSON.stringify(b.reactions) &&
    prev.colors === next.colors
  );
});
