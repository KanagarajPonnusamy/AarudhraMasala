/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { SIZES } from '../constants/theme';
import EmptyState from '../components/EmptyState';

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hrs = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${mon}-${year}  ${hrs}:${mins}`;
}

function statusColor(status) {
  switch ((status || '').toUpperCase()) {
    case 'ORDER PLACED':
    case 'BOOKED':
      return '#F59E0B';
    case 'CONFIRMED':
      return '#10B981';
    case 'SHIPPED':
      return '#3B82F6';
    case 'OUT FOR DELIVERY':
    case 'OUT_FOR_DELIVERY':
      return '#8B5CF6';
    case 'DELIVERED':
      return '#6366F1';
    case 'CANCELLED':
      return '#EF4444';
    default:
      return '#6B7280';
  }
}

const TRACKER_STEPS = [
  'Order Placed',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

function ShippingTracker({ status, theme }) {
  const upper = (status || '').toUpperCase();
  const currentIndex = TRACKER_STEPS.findIndex(
    (s) => s.toUpperCase() === upper
  );

  return (
    <View style={trackerStyles.container}>
      <View style={trackerStyles.dotsRow}>
        {TRACKER_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const filled = isCompleted || isCurrent;

          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <View
                  style={[
                    trackerStyles.line,
                    {
                      backgroundColor: idx <= currentIndex
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                />
              )}
              <View
                style={[
                  trackerStyles.dot,
                  filled
                    ? { backgroundColor: theme.primary }
                    : {
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: theme.border,
                      },
                ]}
              />
            </React.Fragment>
          );
        })}
      </View>

      {/* Labels */}
      <View style={trackerStyles.labelsRow}>
        {TRACKER_STEPS.map((step, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <Text
              key={step}
              style={[
                trackerStyles.label,
                {
                  color: isCurrent ? theme.primary : theme.textSecondary,
                  fontWeight: isCurrent ? '700' : '400',
                },
              ]}
              numberOfLines={2}
            >
              {step}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const MemoizedShippingTracker = React.memo(ShippingTracker);

function OrderCard({ order, theme }) {
  const itemCount = order.orderdetails?.length || 0;
  const isCancelled = order.orderstatus === 'CANCELLED' || order.status === 'Cancelled';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {/* Order Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderId, { color: theme.text }]}>
            {order.id}
          </Text>
          <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
            {formatDate(order.placed_at)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor(order.orderstatus) + '18' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor(order.orderstatus) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: statusColor(order.orderstatus) }]}
          >
            {order.orderstatus}
          </Text>
        </View>
      </View>

      {/* Tracking Number */}
      {order.trackingno ? (
        <View style={[styles.trackingRow, { borderTopColor: theme.border }]}>
          <Feather name="truck" size={14} color={theme.primary} />
          <Text style={[styles.trackingLabel, { color: theme.textSecondary }]}>
            Tracking:
          </Text>
          <Text style={[styles.trackingNo, { color: theme.primary }]}>
            {order.trackingno}
          </Text>
        </View>
      ) : null}

      {/* Shipping Tracker */}
      {!isCancelled && (
        <View style={[styles.trackerSection, { borderTopColor: theme.border }]}>
          <MemoizedShippingTracker status={order.shippingstatus || order.status} theme={theme} />
        </View>
      )}

      {/* Items Summary */}
      <View style={[styles.itemsRow, { borderTopColor: theme.border }]}>
        <Feather name="package" size={16} color={theme.textSecondary} />
        <Text style={[styles.itemsText, { color: theme.textSecondary }]}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <Text style={[styles.paymentMode, { color: theme.textSecondary }]}>
          Cash on Delivery
        </Text>
      </View>

      {/* Product details list */}
      {order.orderdetails?.map((detail, idx) => (
        <View key={idx} style={styles.productRow}>
          <Text
            style={[styles.productName, { color: theme.text }]}
            numberOfLines={1}
          >
            {detail.productname || detail.productcode}
          </Text>
          <Text style={[styles.productQty, { color: theme.textSecondary }]}>
            x{detail.quantity}
          </Text>
          <Text style={[styles.productPrice, { color: theme.text }]}>
            ₹{detail.productprice}
          </Text>
        </View>
      ))}

      {/* Footer */}
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <Feather name="map-pin" size={14} color={theme.textSecondary} />
        <Text
          style={[styles.addressText, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {order.shippingaddress || '—'}
        </Text>
        <Text style={[styles.totalAmount, { color: theme.primary }]}>
          ₹{order.total_amount}
        </Text>
      </View>
    </View>
  );
}

const MemoizedOrderCard = React.memo(OrderCard);

export default function MyOrdersScreen({ navigation }) {
  const { theme } = useTheme();
  const { orders, loading, fetchOrders } = useOrders();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      fetchOrders(user.user_id);
    }
  }, [user?.user_id]);

  const onRefresh = useCallback(async () => {
    if (!user?.user_id) return;
    setRefreshing(true);
    await fetchOrders(user.user_id);
    setRefreshing(false);
  }, [user?.user_id, fetchOrders]);

  const renderItem = useCallback(({ item }) => <MemoizedOrderCard order={item} theme={theme} />, [theme]);

  const renderEmpty = () => (
    <EmptyState
      icon="package"
      title="No orders yet"
      subtitle="Your order history will appear here"
      buttonText="Start Shopping"
      onPress={() => navigation.goBack()}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            My Orders
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {!user ? (
          <View style={styles.loginContainer}>
            <Feather name="lock" size={48} color={theme.textSecondary} />
            <Text style={[styles.loginTitle, { color: theme.text }]}>
              Login Required
            </Text>
            <Text style={[styles.loginSubtitle, { color: theme.textSecondary }]}>
              Please login to view your orders
            </Text>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Feather name="log-in" size={18} color="#FFF" />
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={
              orders.length === 0 ? styles.emptyList : styles.listContent
            }
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS !== 'web'}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={6}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          />
        )}
    </SafeAreaView>
  );
}

const trackerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: {
    fontSize: 9,
    textAlign: 'center',
    width: 56,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: SIZES.padding,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  loginSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    marginTop: 8,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SIZES.padding,
    gap: 14,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  trackingLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  trackingNo: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackerSection: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  itemsText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  paymentMode: {
    fontSize: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  productQty: {
    fontSize: 13,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 6,
    gap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
});
