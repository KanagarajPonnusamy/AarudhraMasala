/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrderContext';
import { SIZES } from '../constants/theme';

function formatDate(isoString) {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hrs = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${mon}-${year}  ${hrs}:${mins}`;
}

function statusColor(status) {
  switch (status) {
    case 'Confirmed':
      return '#10B981';
    case 'Shipped':
      return '#3B82F6';
    case 'Delivered':
      return '#6366F1';
    case 'Cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
}

function OrderCard({ order, theme }) {
  const itemCount = order.orderdetails?.length || 0;

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
          <Text style={[styles.orderId, { color: theme.text }]}>{order.id}</Text>
          <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
            {formatDate(order.placed_at)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor(order.status) + '18' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor(order.status) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: statusColor(order.status) }]}
          >
            {order.status}
          </Text>
        </View>
      </View>

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

      {/* Product list */}
      {order.orderdetails?.map((detail, idx) => (
        <View key={idx} style={styles.productRow}>
          <Text
            style={[styles.productName, { color: theme.text }]}
            numberOfLines={1}
          >
            {detail.productName || detail.productcode}
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
          {order.order?.shippingaddress || '—'}
        </Text>
        <Text style={[styles.totalAmount, { color: theme.primary }]}>
          ₹{order.order?.total_amount}
        </Text>
      </View>
    </View>
  );
}

export default function MyOrdersScreen({ navigation }) {
  const { theme } = useTheme();
  const { orders, loading } = useOrders();

  const renderItem = ({ item }) => <OrderCard order={item} theme={theme} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No orders yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Your order history will appear here
      </Text>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.shopBtn, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
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

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            orders.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 36,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  shopBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
