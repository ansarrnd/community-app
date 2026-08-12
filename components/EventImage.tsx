import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { themeRadius } from '../constants/theme';

interface EventImageProps {
  uri?: string;
  height?: number;
  borderRadius?: number;
}

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80';

export const EventImage: React.FC<EventImageProps> = ({
  uri,
  height = 180,
  borderRadius = themeRadius.md,
}) => {
  const imageSource = uri || DEFAULT_EVENT_IMAGE;

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <ExpoImage
        source={{ uri: imageSource }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        placeholder="L6E8:8.AY.yE00?b.xR*00~q%M~q" // Blurhash fallback placeholder
        transition={300}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    marginBottom: 12,
  },
});
