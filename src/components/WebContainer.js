/**
 * Created by: Kanagaraj P
 * Created on: 04-03-2026
 */
import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { SIZES } from '../constants/theme';

export default function WebContainer({ children, style }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web' || width <= SIZES.maxWidth) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return (
    <View style={[{ flex: 1, alignItems: 'center' }, style]}>
      <View style={{ flex: 1, width: '100%', maxWidth: SIZES.maxWidth, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}
