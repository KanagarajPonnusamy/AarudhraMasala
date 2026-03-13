/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function OrderSuccessScreen({ route, navigation }) {
  const { theme } = useTheme();
  const {
    orderId = '',
    firstName = '',
    email = '',
    phone = '',
    address = {},
    totalAmount = 0,
    originalAmount = 0,
    paymentMethod = 'Cash on Delivery',
    items = [],
  } = route.params || {};

  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [emailOffers, setEmailOffers] = useState(false);

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const showDiscount = originalAmount > totalAmount;

  const addressLines = [
    address.name,
    [address.building, address.street1].filter(Boolean).join(' '),
    address.street2,
    [address.pincode, address.city, address.state].filter(Boolean).join(' '),
    address.country,
    phone,
  ].filter(Boolean);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Order Summary Header */}
      <TouchableOpacity
        style={[styles.summaryBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}
        onPress={() => setSummaryExpanded(!summaryExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.summaryLeft}>
          <Text style={[styles.summaryLabel, { color: theme.primary }]}>Order summary</Text>
          <Feather
            name={summaryExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.primary}
          />
        </View>
        <View style={styles.summaryRight}>
          {showDiscount && (
            <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
              ₹{originalAmount.toFixed(2)}
            </Text>
          )}
          <Text style={[styles.finalPrice, { color: theme.text }]}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded item list */}
      {summaryExpanded && items.length > 0 && (
        <View style={[styles.summaryExpanded, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.summaryItem}>
              <Text style={[styles.summaryItemName, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.summaryItemQty, { color: theme.textSecondary }]}>x{item.quantity}</Text>
              <Text style={[styles.summaryItemPrice, { color: theme.text }]}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Confirmation Icon & Title */}
        <View style={styles.confirmationSection}>
          <View style={[styles.checkCircle, { borderColor: theme.primary }]}>
            <Feather name="check" size={36} color={theme.primary} />
          </View>
          <View style={styles.confirmationTextWrap}>
            {orderId ? (
              <Text style={[styles.confirmationId, { color: theme.textSecondary }]}>
                Confirmation #{orderId}
              </Text>
            ) : null}
            <Text style={[styles.thankYou, { color: theme.text }]}>Thank you, {firstName}!</Text>
          </View>
        </View>

        {/* Your order is confirmed */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Your order is confirmed</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            You'll receive a confirmation email soon
          </Text>
          <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setEmailOffers(!emailOffers)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.border },
                emailOffers && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              {emailOffers && (
                <Feather name="check" size={14} color="#FFF" />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: theme.text }]}>
              Email me with news and offers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Details */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Order details</Text>

          <Text style={[styles.detailLabel, { color: theme.text }]}>Contact information</Text>
          <Text style={[styles.detailValue, { color: theme.textSecondary }]}>{email}</Text>

          <Text style={[styles.detailLabel, { color: theme.text }]}>Shipping address</Text>
          {addressLines.map((line, idx) => (
            <Text key={idx} style={[styles.detailValue, { color: theme.textSecondary }]}>
              {line}
            </Text>
          ))}

          <Text style={[styles.detailLabel, { color: theme.text }]}>Shipping method</Text>
          <Text style={[styles.detailValue, { color: theme.textSecondary }]}>Shipping Charges</Text>

          <Text style={[styles.detailLabel, { color: theme.text }]}>Payment method</Text>
          <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
            {paymentMethod} - ₹{totalAmount.toFixed(2)} INR
          </Text>
        </View>

        {/* Continue Shopping */}
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: theme.primary }]}
          onPress={handleContinueShopping}
        >
          <Feather name="shopping-bag" size={18} color="#FFF" />
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /* Order Summary Bar */
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  /* Expanded summary */
  summaryExpanded: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 13,
  },
  summaryItemQty: {
    fontSize: 13,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  /* Scroll content */
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  /* Confirmation section */
  confirmationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationTextWrap: {
    flex: 1,
  },
  confirmationId: {
    fontSize: 14,
    marginBottom: 2,
  },
  thankYou: {
    fontSize: 22,
    fontWeight: '800',
  },
  /* Cards */
  card: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    marginVertical: 14,
  },
  /* Checkbox */
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  /* Detail sections */
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 21,
  },
  /* Continue Shopping */
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
