/**
 * Created by: Kanagaraj P
 * Created on: 07-03-2026
 */
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CachedImage from './CachedImage';
import { SIZES } from '../constants/theme';
import HtmlText from './HtmlText';

const CARD_SPACING = 12;
const AUTO_SCROLL_DELAY = 4000;
const SWIPE_THRESHOLD = 0.15;
const DEFAULT_HEIGHT_RATIO = 0.4;
const DEFAULT_FG_PADDING = 20;

/**
 * Detect if current device is mobile: native iOS/Android,
 * mobile web browser, or browser responsive/device emulation mode.
 */
function isMobileDevice(screenWidth) {
  // Native apps are always mobile
  if (Platform.OS !== 'web') return true;
  // On web: check user agent for mobile browsers / device emulation
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
      return true;
    }
  }
  // Fallback: narrow viewport = mobile
  return screenWidth < 768;
}

/**
 * Parse a single "key: \"value\"" pageval string into [key, value].
 * e.g. 'bg_clr: "#108474"' → ['bg_clr', '#108474']
 */
function parsePageval(str) {
  if (typeof str !== 'string') return null;
  const match = str.match(/^(\w+)\s*:\s*(.+)$/);
  if (!match) return null;
  const key = match[1];
  let value = match[2].trim();
  // Remove surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  // Try to parse as number for ratio fields
  const num = Number(value);
  return [key, isNaN(num) ? value : num];
}

/**
 * Merge collection items into a single banner object.
 * Each collection item has { id, pagecode, pageval } where pageval is "key: \"value\"".
 */
function parseBannerCollections(collections) {
  if (!Array.isArray(collections) || !collections.length) return null;
  const obj = {};
  collections.forEach((item) => {
    const val = typeof item === 'string' ? item : item?.pageval;
    if (!val) return;
    const parsed = parsePageval(val);
    if (parsed) {
      obj[parsed[0]] = parsed[1];
    }
  });
  return Object.keys(obj).length > 0 ? obj : null;
}

function BannerItem({ item, width, isMobile }) {
  const heightRatio = isMobile
    ? (item.heightMobileRatio > 0 ? item.heightMobileRatio : (item.heightRatio > 0 ? item.heightRatio : DEFAULT_HEIGHT_RATIO))
    : (item.heightRatio > 0 ? item.heightRatio : DEFAULT_HEIGHT_RATIO);
  const bgHeight = Math.round(width * heightRatio);
  const hasFgRatio = item.fg_ratio > 0;
  const fgWidth = hasFgRatio ? Math.round(width * item.fg_ratio) : null;
  const fgHeight = hasFgRatio ? Math.round(bgHeight * item.fg_ratio) : null;
  const hasBg = item.bg_clr || item.bg_img;

  const handlePress = () => {
    if (item.link) {
      const url = item.link.startsWith('http') ? item.link : `https://${item.link}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  const renderForeground = () => {
    const fgStyle = hasFgRatio
      ? { width: fgWidth, height: fgHeight }
      : { padding: DEFAULT_FG_PADDING };

    const hasFgContent = item.fg_img || item.fg_txt || item.fg_clr;
    if (!hasFgContent) return null;

    let fgBgColor = null;
    if (item.fg_clr) {
      fgBgColor = item.fg_clr.length <= 7 ? `${item.fg_clr}73` : item.fg_clr;
    } else if (item.fg_txt) {
      fgBgColor = 'rgba(0,0,0,0.45)';
    }

    const fgContainerStyle = [
      styles.fgContainer,
      fgStyle,
      { borderRadius: 4 },
      fgBgColor ? { backgroundColor: fgBgColor } : null,
    ];

    return (
      <View style={fgContainerStyle}>
        {item.fg_img ? (
          <CachedImage
            source={{ uri: item.fg_img }}
            style={styles.fgImage}
            contentFit="contain"
          />
        ) : null}
        {item.fg_txt ? (
          <HtmlText
            text={item.fg_txt}
            style={[
              styles.fgText,
              { color: item.fg_txt_clr || '#000' },
              !hasFgRatio ? { fontSize: 16 } : null,
            ]}
            color={item.fg_txt_clr || '#000'}
            numberOfLines={3}
          />
        ) : null}
      </View>
    );
  };

  const fg = renderForeground();

  const innerContent = (
    <View style={styles.fgWrapper}>
      {fg}
    </View>
  );

  const content = item.bg_img ? (
    <View style={{ width, height: bgHeight, backgroundColor: item.bg_clr || 'transparent' }}>
      <CachedImage
        source={{ uri: item.bg_img }}
        style={[StyleSheet.absoluteFill, { width, height: bgHeight }]}
        contentFit="cover"
        priority="high"
      />
      {innerContent}
    </View>
  ) : (
    <View style={[styles.bgContainer, { height: bgHeight, backgroundColor: item.bg_clr || 'transparent' }]}>
      {innerContent}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={item.link ? 0.8 : 1}
      onPress={item.link ? handlePress : undefined}
      style={[styles.bannerItem, { width }]}
    >
      {content}
    </TouchableOpacity>
  );
}

export default function BannerSection({ banners }) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Platform.OS === 'web' && screenWidth > SIZES.maxWidth
    ? SIZES.maxWidth
    : screenWidth;
  const cardWidth = contentWidth - SIZES.padding * 2;
  const isMobile = isMobileDevice(screenWidth);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);
  const isUserInteracting = useRef(false);
  const autoScrollTimer = useRef(null);
  const dragStartOffset = useRef(0);

  const items = useMemo(() => {
    // All collections merge into a single banner object
    const parsed = parseBannerCollections(banners);
    return parsed ? [{ ...parsed, _key: '0' }] : [];
  }, [banners]);

  const snapInterval = cardWidth + CARD_SPACING;

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const scrollToIndex = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    activeIndexRef.current = clamped;
    flatListRef.current?.scrollToOffset({
      offset: clamped * snapInterval,
      animated: true,
    });
  }, [snapInterval, items.length]);

  const startAutoScroll = useCallback(() => {
    if (items.length <= 1) return;
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      if (!isUserInteracting.current) {
        const nextIndex = (activeIndexRef.current + 1) % items.length;
        scrollToIndex(nextIndex);
      }
    }, AUTO_SCROLL_DELAY);
  }, [items.length, scrollToIndex, stopAutoScroll]);

  useEffect(() => {
    if (items.length > 1) startAutoScroll();
    return stopAutoScroll;
  }, [items.length, startAutoScroll, stopAutoScroll]);

  const onScrollBeginDrag = (e) => {
    isUserInteracting.current = true;
    dragStartOffset.current = e.nativeEvent.contentOffset.x;
    stopAutoScroll();
  };

  const onScrollEndDrag = (e) => {
    const delta = e.nativeEvent.contentOffset.x - dragStartOffset.current;
    const threshold = cardWidth * SWIPE_THRESHOLD;
    let targetIndex = activeIndexRef.current;
    if (delta > threshold) targetIndex++;
    else if (delta < -threshold) targetIndex--;
    scrollToIndex(targetIndex);
    isUserInteracting.current = false;
    if (items.length > 1) startAutoScroll();
  };

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    activeIndexRef.current = Math.max(0, Math.min(index, items.length - 1));
    isUserInteracting.current = false;
    if (items.length > 1) startAutoScroll();
  };

  if (!items.length) return null;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={items}
        renderItem={({ item }) => <BannerItem item={item} width={cardWidth} isMobile={isMobile} />}
        keyExtractor={(item) => item._key}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        snapToInterval={snapInterval}
        contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (i - 1) * snapInterval,
                i * snapInterval,
                (i + 1) * snapInterval,
              ],
              outputRange: [8, 22, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * snapInterval,
                i * snapInterval,
                (i + 1) * snapInterval,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity, backgroundColor: theme.primary },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  bannerItem: {
    marginRight: CARD_SPACING,
    overflow: 'hidden',
  },
  bgContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fgWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fgImage: {
    width: '100%',
    height: '100%',
  },
  fgText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
