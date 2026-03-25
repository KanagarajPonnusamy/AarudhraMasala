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
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import CustomDialog from '../components/CustomDialog';

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

const ADMIN_STATUSES = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

function OrderCard({ order, theme, isSiteAdmin, user, onUpdateStatus }) {
  const [updating, setUpdating] = useState(false);
  const [dialog, setDialog] = useState({ visible: false, title: '', message: '', status: null, isCancel: false });
  const itemCount = order.orderdetails?.length || 0;
  const isCancelled = order.orderstatus === 'CANCELLED' || order.status === 'Cancelled';
  const isDelivered = order.orderstatus === 'DELIVERED' || order.status === 'Delivered';

  const closeDialog = () => setDialog((d) => ({ ...d, visible: false }));

  const handleConfirm = async () => {
    closeDialog();
    setUpdating(true);
    try {
      await onUpdateStatus(order.id, user.user_id, dialog.status, user.usertype);
    } catch (e) {
      setDialog({
        visible: true,
        title: 'Error',
        message: e.message || 'Failed to update status',
        status: null,
        isCancel: false,
      });
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = (order.orderdetails || []).reduce((sum, d) => {
    const price = parseFloat(d.productprice) || 0;
    const qty = parseInt(d.quantity, 10) || 1;
    return sum + price * qty;
  }, 0);
  const total = parseFloat(order.total_amount) || 0;
  const shippingCharge = Math.max(0, Math.round((total - subtotal) * 100) / 100);

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

      {/* Pricing Breakdown */}
      <View style={[styles.pricingSection, { borderTopColor: theme.border }]}>
        <View style={styles.pricingRow}>
          <Text style={[styles.pricingLabel, { color: theme.textSecondary }]}>Subtotal</Text>
          <Text style={[styles.pricingValue, { color: theme.text }]}>₹{subtotal}</Text>
        </View>
        <View style={styles.pricingRow}>
          <Text style={[styles.pricingLabel, { color: theme.textSecondary }]}>Shipping</Text>
          {shippingCharge > 0 ? (
            <Text style={[styles.pricingValue, { color: theme.text }]}>₹{shippingCharge}</Text>
          ) : (
            <Text style={[styles.pricingValue, { color: theme.primary, fontWeight: '700' }]}>FREE</Text>
          )}
        </View>
        <View style={[styles.pricingDivider, { backgroundColor: theme.border }]} />
        <View style={styles.pricingRow}>
          <Text style={[styles.pricingTotalLabel, { color: theme.text }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: theme.primary }]}>₹{total}</Text>
        </View>
      </View>

      {/* Admin Status Actions */}
      {isSiteAdmin && !isCancelled && !isDelivered && (
        <View style={[styles.adminSection, { borderTopColor: theme.border }]}>
          {updating ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 8 }} />
          ) : (
            <>
              <View style={styles.adminBtnRow}>
                {ADMIN_STATUSES.map((s) => {
                  const isCurrent =
                    order.status?.toLowerCase() === s.toLowerCase() ||
                    order.orderstatus?.toLowerCase() === s.toLowerCase() ||
                    order.shippingstatus?.toLowerCase() === s.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={s}
                      disabled={isCurrent}
                      style={[
                        styles.adminBtn,
                        { borderColor: theme.primary },
                        isCurrent && { opacity: 0.4 },
                      ]}
                      onPress={() =>
                        setDialog({
                          visible: true,
                          title: 'Update Status',
                          message: `Set order ${order.id} to "${s}"?`,
                          status: s,
                          isCancel: false,
                        })
                      }
                    >
                      <Text style={[styles.adminBtnText, { color: theme.primary }]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: '#EF4444' }]}
                onPress={() =>
                  setDialog({
                    visible: true,
                    title: 'Cancel Order',
                    message: `Are you sure you want to cancel order ${order.id}?`,
                    status: 'Cancelled',
                    isCancel: true,
                  })
                }
              >
                <Feather name="x-circle" size={14} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Custom Dialog */}
      <CustomDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        onDismiss={closeDialog}
        buttons={
          dialog.status
            ? [
                { text: dialog.isCancel ? 'No' : 'Cancel', style: 'cancel', onPress: closeDialog },
                {
                  text: dialog.isCancel ? 'Yes, Cancel' : 'Confirm',
                  style: dialog.isCancel ? 'destructive' : undefined,
                  onPress: handleConfirm,
                },
              ]
            : [{ text: 'OK', onPress: closeDialog }]
        }
      />

      {/* Footer */}
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <Feather name="map-pin" size={14} color={theme.textSecondary} />
        <Text
          style={[styles.addressText, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {order.shippingaddress || '—'}
        </Text>
      </View>
    </View>
  );
}

const MemoizedOrderCard = React.memo(OrderCard);

export default function MyOrdersScreen({ navigation }) {
  const { theme } = useTheme();
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const isSiteAdmin = user?.usertype === 'site-admin';

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      fetchOrders(user.user_id, user.usertype);
    }
  }, [user?.user_id]);

  const onRefresh = useCallback(async () => {
    if (!user?.user_id) return;
    setRefreshing(true);
    await fetchOrders(user.user_id, user.usertype);
    setRefreshing(false);
  }, [user?.user_id, user?.usertype, fetchOrders]);

  const renderItem = useCallback(
    ({ item }) => (
      <MemoizedOrderCard
        order={item}
        theme={theme}
        isSiteAdmin={isSiteAdmin}
        user={user}
        onUpdateStatus={updateOrderStatus}
      />
    ),
    [theme, isSiteAdmin, user, updateOrderStatus]
  );

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
        <Header navigation={navigation} showBack />
        <Breadcrumb
          crumbs={[
            { label: 'Home', screen: 'Main' },
            { label: 'My Orders' },
          ]}
        />

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
  pricingSection: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    gap: 6,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 13,
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  pricingDivider: {
    height: 1,
    marginVertical: 2,
  },
  pricingTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
  adminSection: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  adminBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adminBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  adminBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
  },
});
