import React, { useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { PencilFrame } from './PencilFrame';
import { PencilButton } from './PencilButton';
import { PencilInput } from './PencilInput';
import { useTheme } from '../theme/ThemeProvider';
import { ImageIcon, XIcon } from './icons';
import { api, uploadImage } from '../api/client';

export function Composer({ onPosted }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6 - images.length,
    });
    if (res.canceled) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const asset of res.assets) {
        const url = await uploadImage(asset);
        uploaded.push(url);
      }
      setImages([...images, ...uploaded].slice(0, 6));
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!text.trim() && images.length === 0) return;
    setBusy(true);
    try {
      const { data } = await api.post('/posts', { text: text.trim(), images });
      setText('');
      setImages([]);
      onPosted?.(data.post);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PencilFrame filled elevated fillColor={colors.paper} radius={22} padding={14} style={{ marginBottom: 16 }}>
      <PencilInput
        value={text}
        onChangeText={setText}
        placeholder={t('feed.newPost')}
        multiline
        numberOfLines={3}
        maxLength={2000}
        showCounter={text.length > 1500}
        autoCapitalize="sentences"
      />
      {images.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {images.map((uri) => (
            <View key={uri} style={{ marginRight: 8, marginBottom: 8 }}>
              <Image source={{ uri }} style={{ width: 76, height: 76, borderRadius: 12 }} />
              <Pressable
                onPress={() => setImages(images.filter((u) => u !== uri))}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: colors.paper,
                  borderRadius: 12,
                  padding: 2,
                  borderWidth: 1,
                  borderColor: colors.line,
                }}
              >
                <XIcon size={14} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        <Pressable
          onPress={pickImage}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ImageIcon size={22} color={colors.ink} />
          <Text style={{ ...typography.body, color: colors.ink, marginLeft: 6 }}>
            {t('feed.addImage')}
          </Text>
        </Pressable>
        <PencilButton
          label={t('feed.publish')}
          onPress={submit}
          loading={busy}
          size="sm"
          disabled={!text.trim() && images.length === 0}
        />
      </View>
    </PencilFrame>
  );
}
