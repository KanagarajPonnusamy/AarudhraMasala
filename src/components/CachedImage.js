import React from 'react';
import { Image } from 'expo-image';

export default function CachedImage({ source, style, contentFit, ...rest }) {
  const uri = source?.uri;
  if (!uri) return null;

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit || 'cover'}
      cachePolicy="memory-disk"
      transition={200}
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      placeholderContentFit="cover"
      {...rest}
    />
  );
}
