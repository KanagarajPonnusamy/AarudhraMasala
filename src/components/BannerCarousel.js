/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CachedImage from './CachedImage';
import { SIZES } from '../constants/theme';
import { BANNERS } from '../constants/data';

const CARD_SPACING = 10;
const AUTO_SCROLL_DELAY = 4000;
const SWIPE_THRESHOLD = 0.15; // 15% of card width to trigger next/prev

export default function BannerCarousel() {
  const { theme } = useTheme();
  const { width: rawScreenWidth } = useWindowDimensions();
  const screenWidth = Platform.OS === 'web' && rawScreenWidth > SIZES.maxWidth
    ? SIZES.maxWidth
    : rawScreenWidth;
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const initialIndex = 2; // start at 3rd item (0-based)
  const activeIndexRef = useRef(initialIndex);
  const isUserInteracting = useRef(false);
  const autoScrollTimer = useRef(null);
  const dragStartOffset = useRef(0);

  const cardWidth = useMemo(() => Math.min(Math.round(screenWidth * 0.7), 300), [screenWidth]);
  const cardHeight = useMemo(() => Math.round(cardWidth * 1.05), [cardWidth]);
  const imageHeight = useMemo(() => Math.round(cardWidth * 0.75), [cardWidth]);
  const sideSpacing = useMemo(() => (screenWidth - cardWidth) / 2, [screenWidth, cardWidth]);
  const snapInterval = useMemo(() => cardWidth + CARD_SPACING, [cardWidth]);
  const totalContentWidth = useMemo(() => BANNERS.length * snapInterval, [snapInterval]);
  const isScrollable = totalContentWidth > screenWidth;

  const scrollToIndex = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, BANNERS.length - 1));
    activeIndexRef.current = clamped;
    flatListRef.current?.scrollToOffset({
      offset: clamped * snapInterval,
      animated: true,
    });
  }, [snapInterval]);

  // Auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      if (!isUserInteracting.current) {
        const nextIndex = (activeIndexRef.current + 1) % BANNERS.length;
        scrollToIndex(nextIndex);
      }
    }, AUTO_SCROLL_DELAY);
  }, [scrollToIndex, stopAutoScroll]);

  useEffect(() => {
    if (isScrollable) {
      startAutoScroll();
    }
    return stopAutoScroll;
  }, [isScrollable, startAutoScroll, stopAutoScroll]);

  // Drag handlers
  const onScrollBeginDrag = (e) => {
    isUserInteracting.current = true;
    dragStartOffset.current = e.nativeEvent.contentOffset.x;
    stopAutoScroll();
  };

  const onScrollEndDrag = (e) => {
    const currentOffset = e.nativeEvent.contentOffset.x;
    const delta = currentOffset - dragStartOffset.current;
    const threshold = cardWidth * SWIPE_THRESHOLD;
    let targetIndex = activeIndexRef.current;

    if (delta > threshold) {
      targetIndex = activeIndexRef.current + 1;
    } else if (delta < -threshold) {
      targetIndex = activeIndexRef.current - 1;
    }

    scrollToIndex(targetIndex);
    isUserInteracting.current = false;
    if (isScrollable) startAutoScroll();
  };

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    activeIndexRef.current = Math.max(0, Math.min(index, BANNERS.length - 1));
    isUserInteracting.current = false;
    if (isScrollable) startAutoScroll();
  };

  // Mouse hover (web)
  const onMouseEnter = () => {
    isUserInteracting.current = true;
    stopAutoScroll();
  };

  const onMouseLeave = () => {
    isUserInteracting.current = false;
    if (isScrollable) startAutoScroll();
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const renderBanner = ({ item, index }) => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.bannerWrapper,
          { width: cardWidth, transform: [{ scale }] },
        ]}
      >
        <View style={[styles.bannerCard, { backgroundColor: item.color, height: cardHeight }]}>
          <CachedImage source={{ uri: item.image }} style={[styles.bannerImage, { height: imageHeight }]} contentFit="cover" />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.bannerSubtitle} numberOfLines={2}>{item.subtitle}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const hoverProps = Platform.OS === 'web'
    ? { onMouseEnter, onMouseLeave }
    : {};

  return (
    <View style={styles.container} {...hoverProps}>
      <Animated.FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        scrollEnabled
        initialScrollIndex={isScrollable ? initialIndex : undefined}
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
        contentContainerStyle={{
          paddingHorizontal: isScrollable ? sideSpacing - CARD_SPACING / 2 : 0,
          ...(!isScrollable && { flexGrow: 1, justifyContent: 'center' }),
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={styles.dots}>
        {BANNERS.map((_, i) => {
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
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: theme.primary,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  bannerWrapper: {
    marginHorizontal: CARD_SPACING / 2,
  },
  bannerCard: {
    width: '100%',
    borderRadius: SIZES.radius + 4,
    overflow: 'hidden',
  },
  bannerTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  bannerImage: {
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
