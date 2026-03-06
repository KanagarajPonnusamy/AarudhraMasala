/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

const AUTO_SCROLL_DELAY = 4000;
const CARD_SPACING = 10;

export default function PromoBanner({ promos }) {
  const { theme } = useTheme();

  // If no promos prop, render the original static banner
  if (!promos || promos.length === 0) {
    return (
      <View style={[styles.staticContainer, { backgroundColor: theme.isDark ? '#1a2e2a' : '#E8F5F1' }]}>
        <View style={styles.staticContent}>
          <View style={styles.iconCircle}>
            <Feather name="truck" size={20} color={theme.primary} />
          </View>
          <View style={styles.staticTextContainer}>
            <Text style={[styles.staticTitle, { color: theme.text }]}>Free Delivery on orders above ₹499</Text>
            <Text style={[styles.staticSubtitle, { color: theme.textSecondary }]}>
              Pure & authentic masalas delivered to your doorstep
            </Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.staticBtn, { backgroundColor: theme.primary }]}>
          <Text style={styles.staticBtnText}>Order Now</Text>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return <PromoCarousel promos={promos} theme={theme} />;
}

const PROMO_COLORS = ['#108474', '#D4A373', '#E76F51', '#8B5E3C', '#6B8E23', '#9B2335'];

function PromoCarousel({ promos, theme }) {
  const cardWidth = 350;
  const cardHeight = Math.round(cardWidth * 0.55); // ~192px, a 16:9-ish ratio
  const snapInterval = useMemo(() => cardWidth + CARD_SPACING, [cardWidth]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);
  const isUserInteracting = useRef(false);
  const autoScrollTimer = useRef(null);
  const dragStartOffset = useRef(0);

  // Scroll item by item, from first to last
  const maxIndex = Math.max(0, promos.length - 1);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const scrollToIndex = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    activeIndexRef.current = clamped;
    flatListRef.current?.scrollToOffset({
      offset: clamped * snapInterval,
      animated: true,
    });
  }, [snapInterval, maxIndex]);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (promos.length <= 1) return;
    autoScrollTimer.current = setInterval(() => {
      if (!isUserInteracting.current) {
        const nextIndex = activeIndexRef.current >= maxIndex
          ? 0
          : activeIndexRef.current + 1;
        scrollToIndex(nextIndex);
      }
    }, AUTO_SCROLL_DELAY);
  }, [promos.length, maxIndex, scrollToIndex, stopAutoScroll]);

  useEffect(() => {
    if (promos.length > 1) startAutoScroll();
    return stopAutoScroll;
  }, [promos.length, startAutoScroll, stopAutoScroll]);

  // --- Interaction handlers ---

  const onScrollBeginDrag = (e) => {
    isUserInteracting.current = true;
    dragStartOffset.current = e.nativeEvent.contentOffset.x;
    stopAutoScroll();
  };

  const onScrollEndDrag = (e) => {
    const currentOffset = e.nativeEvent.contentOffset.x;
    const delta = currentOffset - dragStartOffset.current;
    const threshold = cardWidth * 0.15;
    let targetIndex = activeIndexRef.current;

    if (delta > threshold) {
      targetIndex = activeIndexRef.current + 1;
    } else if (delta < -threshold) {
      targetIndex = activeIndexRef.current - 1;
    }

    scrollToIndex(targetIndex);
    isUserInteracting.current = false;
    if (promos.length > 1) startAutoScroll();
  };

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    activeIndexRef.current = Math.max(0, Math.min(index, maxIndex));
    isUserInteracting.current = false;
    if (promos.length > 1) startAutoScroll();
  };

  // Mouse hover (web) — pause auto-scroll on hover
  const onMouseEnter = () => {
    isUserInteracting.current = true;
    stopAutoScroll();
  };

  const onMouseLeave = () => {
    isUserInteracting.current = false;
    if (promos.length > 1) startAutoScroll();
  };

  // Touch start/end (mobile) — pause auto-scroll on touch
  const onTouchStart = () => {
    isUserInteracting.current = true;
    stopAutoScroll();
  };

  const onTouchEnd = () => {
    isUserInteracting.current = false;
    if (promos.length > 1) startAutoScroll();
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const getPromoImage = (item) =>
    item.promourl || item.imageurl || item.image || item.promoimage || null;

  const renderPromo = ({ item, index }) => {
    const bgColor = PROMO_COLORS[index % PROMO_COLORS.length];
    const imageUri = getPromoImage(item);

    return (
      <View style={[styles.promoCard, { width: cardWidth, height: cardHeight, backgroundColor: bgColor }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.promoImage} />
        ) : (
          <View style={styles.promoIconArea}>
            <View style={styles.promoIconCircle}>
              <Feather name="gift" size={20} color="#FFF" />
            </View>
          </View>
        )}
        <View style={styles.promoOverlay}>
          <Text style={styles.promoName} numberOfLines={2}>{item.promoname}</Text>
          {item.promocode ? (
            <View style={styles.promoCodeBadge}>
              <Text style={styles.promoCodeText}>{item.promocode}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const hoverProps = Platform.OS === 'web'
    ? { onMouseEnter, onMouseLeave }
    : {};

  const touchProps = Platform.OS !== 'web'
    ? { onTouchStart, onTouchEnd }
    : {};

  return (
    <View style={styles.carouselContainer} {...hoverProps} {...touchProps}>
      <Animated.FlatList
        ref={flatListRef}
        data={promos}
        renderItem={renderPromo}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        bounces={false}
        contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      {promos.length > 1 && (
        <View style={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => {
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Static fallback styles
  staticContainer: {
    marginHorizontal: SIZES.padding,
    marginTop: 24,
    borderRadius: SIZES.radius,
    padding: 16,
  },
  staticContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16,132,116,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staticTextContainer: {
    flex: 1,
  },
  staticTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  staticSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  staticBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  staticBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Carousel styles
  carouselContainer: {
    marginTop: 24,
  },
  promoCard: {
    borderRadius: SIZES.radius + 2,
    overflow: 'hidden',
  },
  promoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoIconArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  promoName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  promoCodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  promoCodeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
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
