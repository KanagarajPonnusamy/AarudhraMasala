import React from 'react';
import { Image } from 'expo-image';

function CachedImage({ source, style, contentFit, priority, recyclingKey, ...rest }) {
  const uri = source?.uri;
  if (!uri) return null;

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit || 'cover'}
      cachePolicy="memory-disk"
      transition={100}
      priority={priority || 'normal'}
      recyclingKey={recyclingKey}
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      placeholderContentFit="cover"
      {...rest}
    />
  );
}

export default React.memo(CachedImage);
